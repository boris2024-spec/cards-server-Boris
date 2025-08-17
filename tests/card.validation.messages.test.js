import cardSchema from '../cards/validation/cardValidationSchema.js';

const makeValidCard = () => ({
    title: 'Title',
    subtitle: 'Subtitle',
    description: 'Some description text',
    phone: '050-123 4567',
    email: 'user@example.com',
    web: 'https://example.com',
    image: { url: 'https://pics.example.com/img.png', alt: 'An image' },
    address: {
        state: '',
        country: 'IL',
        city: 'Tel Aviv',
        street: 'Herzl',
        houseNumber: 12,
        zip: 12345,
    },
    bizNumber: '',
    user_id: '',
});

const validate = (obj, opts = {}) => cardSchema.validate(obj, { abortEarly: false, stripUnknown: true, ...opts });

describe('card validation messages', () => {
    test('valid card passes', () => {
        const card = makeValidCard();
        const { error } = validate(card);
        expect(error).toBeUndefined();
    });

    test('missing required fields show required messages & paths', () => {
        const card = makeValidCard();
        delete card.title;
        delete card.address.street;
        const { error } = validate(card);
        expect(error).toBeDefined();
        const map = error.details.map(d => ({ path: d.path.join('.'), message: d.message }));
        expect(map).toEqual(expect.arrayContaining([
            { path: 'title', message: 'title is required' },
            { path: 'address.street', message: 'street is required' },
        ]));
    });

    test('invalid phone', () => {
        const card = makeValidCard();
        card.phone = '12345';
        const { error } = validate(card);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('phone must be a valid phone number (e.g. 050-123 4567)');
        expect(error.details[0].path).toEqual(['phone']);
    });

    test('invalid email', () => {
        const card = makeValidCard();
        card.email = 'bad';
        const { error } = validate(card);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('email must be a valid email');
        expect(error.details[0].path).toEqual(['email']);
    });

    test('web empty ok', () => {
        const card = makeValidCard();
        card.web = '';
        const { error } = validate(card);
        expect(error).toBeUndefined();
    });

    test('invalid web url', () => {
        const card = makeValidCard();
        card.web = 'htp://bad';
        const { error } = validate(card);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe('web must be a valid url');
    });

    test('invalid image.url', () => {
        const card = makeValidCard();
        card.image.url = 'bad';
        const { error } = validate(card);
        expect(error).toBeDefined();
        const det = error.details.find(d => d.path.join('.') === 'image.url');
        expect(det).toBeDefined();
        expect(det.message).toBe('image.url must be a valid url');
    });

    test('image.alt too short', () => {
        const card = makeValidCard();
        card.image.alt = 'a';
        const { error } = validate(card);
        expect(error).toBeDefined();
        const det = error.details.find(d => d.path.join('.') === 'image.alt');
        expect(det.message).toBe('image.alt must have at least 2 chars');
    });

    test('houseNumber not a number', () => {
        const card = makeValidCard();
        card.address.houseNumber = 'abc';
        const { error } = validate(card);
        expect(error).toBeDefined();
        const det = error.details.find(d => d.path.join('.') === 'address.houseNumber');
        expect(det.message).toBe('houseNumber must be a number');
    });

    test('zip allows empty string', () => {
        const card = makeValidCard();
        card.address.zip = '';
        const { error } = validate(card);
        expect(error).toBeUndefined();
    });

    test('zip allows null', () => {
        const card = makeValidCard();
        card.address.zip = null;
        const { error } = validate(card);
        expect(error).toBeUndefined();
    });

    test('bizNumber invalid length triggers 7 digits message', () => {
        const card = makeValidCard();
        card.bizNumber = 123; // too short
        const { error } = validate(card);
        expect(error).toBeDefined();
        const det = error.details.find(d => d.path[0] === 'bizNumber');
        expect(det.message).toBe('bizNumber must be 7 digits');
    });

    test('multiple errors produce distinct paths', () => {
        const card = makeValidCard();
        card.phone = 'x';
        card.email = 'bad';
        card.image.url = 'bad';
        card.address.houseNumber = 'NaN';
        const { error } = validate(card);
        expect(error).toBeDefined();
        const paths = error.details.map(d => d.path.join('.'));
        expect(paths).toEqual(expect.arrayContaining([
            'phone', 'email', 'image.url', 'address.houseNumber'
        ]));
    });
});
