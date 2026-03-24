/**
 * Note CRUD routes.
 *
 * Why separated: Keeps route definitions isolated from server setup,
 * middleware config, and model definitions. Each route file owns one
 * resource, making it easy to find and modify endpoint behavior.
 */
export declare const noteRouter: import("express-serve-static-core").Router;
