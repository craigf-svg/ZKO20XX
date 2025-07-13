use dotenv::dotenv;
use std::env;

pub fn get_app_version() -> String {
    dotenv().ok(); // Loads .env at runtime
    env::var("APP_VERSION").unwrap_or_else(|_| env!("CARGO_PKG_VERSION").to_string())
}
