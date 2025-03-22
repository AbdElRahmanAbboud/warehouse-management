# Project Setup

## Prerequisites
Ensure you have PHP **8.2 or higher** installed and the following extensions enabled:

```ini
extension=curl
extension=fileinfo
extension=gd
extension=intl
extension=mbstring
extension=exif
extension=openssl
extension=zip
```

## Installation Steps

1. Clone the repository:
   ```sh
   git clone https://github.com/AbdElRahmanAbboud/warehouse-management.git
   cd warehouse-management
   ```

2. Install PHP dependencies:
   ```sh
   composer install
   ```

3. Install Node.js dependencies:
   ```sh
   npm install
   ```

4. Copy the environment file and update database credentials:
   ```sh
   cp .env.example .env
   ```
   
   Open the `.env` file and update the database configuration according to your setup. You can use either SQLite or MySQL:
   
   **For SQLite:**
   ```ini
   DB_CONNECTION=sqlite
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   # DB_DATABASE=laravel
   # DB_USERNAME=root
   # DB_PASSWORD=
   ```
   
   **For MySQL:**
   ```ini
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database_name
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

5. Generate application key:
   ```sh
   php artisan key:generate
   ```

6. Create a symbolic link for storage:
   ```sh
   php artisan storage:link
   ```

7. Run database migrations and seed data:
   ```sh
   php artisan migrate --seed
   ```

8. Compile assets and start the local development server:
   ```sh
   composer run dev
   ```

9. Open the application in your browser:
    [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## Default Admin Credentials

- **Email:** `admin@site.com`
- **Password:** `1`

Log in with the credentials above to access the admin panel.

