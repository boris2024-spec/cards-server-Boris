// Helper middleware to standardize success responses
export default function responseWrapper(req, res, next) {
    res.success = (data, status = 200) => res.status(status).json({ data });
    next();
}
