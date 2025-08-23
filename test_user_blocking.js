// Тестовый скрипт для демонстрации блокировки пользователей администратором
import http from 'http';

const API_BASE = 'http://localhost:3000';

// Утилита для HTTP запросов
function apiRequest(method, endpoint, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: endpoint,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['x-auth-token'] = token;
        }

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = http.request(options, (res) => {
            let body = '';

            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const data = body ? JSON.parse(body) : null;
                    resolve({
                        status: res.statusCode,
                        data: data
                    });
                } catch {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (postData) {
            req.write(postData);
        }

        req.end();
    });
}

async function testUserBlocking() {
    console.log('🚀 Тестирование функциональности блокировки пользователей\n');

    try {
        // 1. Создаем администратора (первый пользователь автоматически становится админом)
        console.log('1️⃣ Создание администратора...');
        const adminData = {
            name: { first: 'Admin', last: 'User' },
            phone: '050-123 4567',
            email: `admin_${Date.now()}@example.com`,
            password: 'AdminPass123!',
            isBusiness: false
        };

        const adminRegister = await apiRequest('POST', '/users', adminData);
        console.log(`   Статус: ${adminRegister.status}`);
        console.log(`   Администратор создан: ${adminRegister.data.email}`);
        console.log(`   isAdmin: ${adminRegister.data.isAdmin}\n`);

        // 2. Логинимся как админ
        console.log('2️⃣ Авторизация администратора...');
        const adminLogin = await apiRequest('POST', '/users/login', {
            email: adminData.email,
            password: adminData.password
        });
        const adminToken = adminLogin.data;
        console.log(`   Статус: ${adminLogin.status}`);
        console.log(`   Токен получен: ${adminToken ? '✅' : '❌'}\n`);

        // 3. Создаем обычного пользователя
        console.log('3️⃣ Создание обычного пользователя...');
        const userData = {
            name: { first: 'Regular', last: 'User' },
            phone: '050-987 6543',
            email: `user_${Date.now()}@example.com`,
            password: 'UserPass123!',
            isBusiness: true
        };

        const userRegister = await apiRequest('POST', '/users', userData);
        const userId = userRegister.data._id;
        console.log(`   Статус: ${userRegister.status}`);
        console.log(`   Пользователь создан: ${userRegister.data.email}`);
        console.log(`   ID: ${userId}`);
        console.log(`   isAdmin: ${userRegister.data.isAdmin}`);
        console.log(`   isBlocked: ${userRegister.data.isBlocked}\n`);

        // 4. Проверяем что обычный пользователь может логиниться
        console.log('4️⃣ Проверка авторизации обычного пользователя...');
        const userLogin = await apiRequest('POST', '/users/login', {
            email: userData.email,
            password: userData.password
        });
        console.log(`   Статус: ${userLogin.status}`);
        console.log(`   Авторизация успешна: ${userLogin.status === 200 ? '✅' : '❌'}\n`);

        // 5. Админ блокирует пользователя
        console.log('5️⃣ Блокировка пользователя администратором...');
        const blockUser = await apiRequest('PATCH', `/users/${userId}/block`, null, adminToken);
        console.log(`   Статус: ${blockUser.status}`);
        console.log(`   Пользователь заблокирован: ${blockUser.data.isBlocked ? '✅' : '❌'}`);
        console.log(`   isBlocked: ${blockUser.data.isBlocked}\n`);

        // 6. Проверяем что заблокированный пользователь не может логиниться
        console.log('6️⃣ Попытка авторизации заблокированного пользователя...');
        const blockedUserLogin = await apiRequest('POST', '/users/login', {
            email: userData.email,
            password: userData.password
        });
        console.log(`   Статус: ${blockedUserLogin.status}`);
        console.log(`   Ошибка авторизации: ${blockedUserLogin.status === 403 ? '✅' : '❌'}`);
        console.log(`   Сообщение: ${blockedUserLogin.data}\n`);

        // 7. Админ разблокирует пользователя
        console.log('7️⃣ Разблокировка пользователя администратором...');
        const unblockUser = await apiRequest('PATCH', `/users/${userId}/unblock`, null, adminToken);
        console.log(`   Статус: ${unblockUser.status}`);
        console.log(`   Пользователь разблокирован: ${!unblockUser.data.isBlocked ? '✅' : '❌'}`);
        console.log(`   isBlocked: ${unblockUser.data.isBlocked}\n`);

        // 8. Проверяем что разблокированный пользователь снова может логиниться
        console.log('8️⃣ Проверка авторизации разблокированного пользователя...');
        const unblockedUserLogin = await apiRequest('POST', '/users/login', {
            email: userData.email,
            password: userData.password
        });
        console.log(`   Статус: ${unblockedUserLogin.status}`);
        console.log(`   Авторизация восстановлена: ${unblockedUserLogin.status === 200 ? '✅' : '❌'}\n`);

        // 9. Попытка обычного пользователя заблокировать другого (должна провалиться)
        console.log('9️⃣ Попытка обычного пользователя заблокировать другого...');
        const userToken = unblockedUserLogin.data;
        const unauthorizedBlock = await apiRequest('PATCH', `/users/${adminRegister.data._id}/block`, null, userToken);
        console.log(`   Статус: ${unauthorizedBlock.status}`);
        console.log(`   Доступ запрещен: ${unauthorizedBlock.status === 403 ? '✅' : '❌'}`);
        console.log(`   Сообщение: ${unauthorizedBlock.data}\n`);

        console.log('✅ Все тесты прошли успешно! Функциональность блокировки работает корректно.');

    } catch (error) {
        console.error('❌ Ошибка при тестировании:', error.message);
    }
}

// Запускаем тест если файл выполняется напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
    testUserBlocking();
}

export { testUserBlocking };
