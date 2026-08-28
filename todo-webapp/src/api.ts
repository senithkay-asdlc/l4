// Typed client for todo-api, generated from its committed openapi.yaml.
// Same-origin baseUrl — nginx proxies /api to the sibling (react-webapp skill).

import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/todo-api";
import { getAccessToken } from "./auth";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
};

export const todoApi = createClient<paths>({ baseUrl: "/api" });
todoApi.use(authMiddleware);
