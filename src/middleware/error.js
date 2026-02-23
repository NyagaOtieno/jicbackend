export function notFound(req, res) {
  res.status(404).json({ success: false, message: "Not found" });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Server error",
    detail: process.env.NODE_ENV === "production" ? undefined : String(err.stack || err)
  });
}