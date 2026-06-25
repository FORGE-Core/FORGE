import { NextResponse } from "next/server";
import { isServiceError } from "@/services/server/errors";

export function serviceErrorResponse(error: unknown) {
  if (isServiceError(error)) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error("[api]", error);
  const message =
    error instanceof Error ? error.message : "Error interno del servidor";
  return NextResponse.json({ error: message }, { status: 500 });
}

export function serviceErrorJsonResponse(error: unknown) {
  if (isServiceError(error)) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("[api]", error);
  const message =
    error instanceof Error ? error.message : "Error interno del servidor";
  return Response.json({ error: message }, { status: 500 });
}
