"""Structured error responses: every error body is {"error": {code, message, details?}}."""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

log = logging.getLogger("snug")

_STATUS_CODES = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    405: "method_not_allowed",
    409: "conflict",
    422: "validation_error",
    429: "rate_limited",
    503: "service_unavailable",
}


class AppError(Exception):
    def __init__(self, status_code: int, code: str, message: str, details: list[dict] | None = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details


def error_json(status_code: int, code: str, message: str, details: list[dict] | None = None, headers: dict | None = None) -> JSONResponse:
    body: dict = {"code": code, "message": message}
    if details:
        body["details"] = details
    return JSONResponse(status_code=status_code, content={"error": body}, headers=headers)


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError):
        return error_json(exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(_: Request, exc: StarletteHTTPException):
        code = _STATUS_CODES.get(exc.status_code, "error")
        message = exc.detail if isinstance(exc.detail, str) else code.replace("_", " ").capitalize()
        return error_json(exc.status_code, code, message, headers=getattr(exc, "headers", None))

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_: Request, exc: RequestValidationError):
        # Return field locations and messages only — never echo raw input back.
        details = [{"field": ".".join(str(p) for p in e["loc"] if p not in ("query", "path", "body")), "message": e["msg"]} for e in exc.errors()]
        return error_json(422, "validation_error", "One or more request parameters are invalid.", details)

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception):
        log.exception("Unhandled error", exc_info=exc)
        return error_json(500, "internal_error", "Something went wrong on our side.")
