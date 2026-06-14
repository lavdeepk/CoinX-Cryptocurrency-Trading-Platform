<!-- Header -->
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=250&section=header&text=CoinX&fontSize=90&desc=Cryptocurrency%20Trading%20Platform&descAlignY=76&descAlign=50" alt="CoinX Header" />
</div>

<br/>

<div align="center">
  <p><b>A full-stack cryptocurrency trading platform similar to Binance, built with Spring Boot backend and React frontend. This application provides real-time trading capabilities, wallet management, portfolio tracking, and secure payment processing.</b></p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br/>

## 🌟 Features

<table>
  <tr>
    <td width="50%">
      <h3>🔐 Authentication & Security</h3>
      <ul>
        <li>JWT-based authentication with Spring Security</li>
        <li>OAuth2 client integration for social login</li>
        <li>Two-factor authentication (2FA) support</li>
        <li>Secure password encryption and validation</li>
      </ul>
    </td>
    <td width="50%">
      <h3>💰 Trading & Portfolio Management</h3>
      <ul>
        <li>Real-time cryptocurrency price tracking</li>
        <li>Buy/sell cryptocurrency with live market data</li>
        <li>Portfolio overview with profit/loss calculations</li>
        <li>Watchlist functionality for favorite coins</li>
        <li>Order management (market, limit orders)</li>
        <li>Trading activity history</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>💳 Wallet & Payments</h3>
      <ul>
        <li>Multi-currency wallet support</li>
        <li>Deposit and withdrawal functionality</li>
        <li>Payment gateway integration: <b>Razorpay</b>, <b>Stripe</b></li>
        <li>Transaction history tracking</li>
        <li>Secure payment processing</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📊 Analytics & Visualization</h3>
      <ul>
        <li>Interactive charts using ApexCharts and Recharts</li>
        <li>Real-time price graphs</li>
        <li>Portfolio performance analytics</li>
        <li>Market trends visualization</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td colspan="2">
      <h3>👤 User Management</h3>
      <ul>
        <li>User profile management and Account verification</li>
        <li>Email notifications</li>
        <li>Admin panel for withdrawals and user management</li>
      </ul>
    </td>
  </tr>
</table>

## 🛠️ Technology Stack

<details>
<summary><b>Backend (Spring Boot) detailed stack</b></summary>

- **Framework**: Spring Boot 3.2.4
- **Language**: Java 17/19
- **Database**: MySQL
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **Key Dependencies**: Spring Data JPA, Spring Security, Spring Validation, Spring Mail, Spring OAuth2 Client, Lombok, JWT (jjwt 0.11.1), Razorpay Java SDK, Stripe Java SDK, JSON Path

</details>

<details>
<summary><b>Frontend (React) detailed stack</b></summary>

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **UI Library**: Radix UI Components
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: Redux + Redux Thunk
- **Routing**: React Router DOM 6.21.3
- **Charts**: ApexCharts, Recharts
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Yup/Zod validation
- **Key Dependencies**: Radix UI, Lucide React, Class Variance Authority, Tailwind Merge, Input OTP

</details>

## 📁 Project Structure

### Backend Structure
```text
Backend-Spring boot/
├── src/main/java/com/himanshu/
│   ├── TreadingPlateformApplication.java
│   ├── config/           # Security, CORS, and app configurations
│   ├── controller/       # REST API endpoints (13 controllers)
│   ├── domain/           # Domain models and enums (9 files)
│   ├── exception/        # Custom exception handlers (5 files)
│   ├── model/            # Entity models (20 entities)
│   ├── repository/       # JPA repositories (14 repositories)
│   ├── request/          # Request DTOs (5 files)
│   ├── response/         # Response DTOs (4 files)
│   ├── service/          # Business logic (31 services)
│   └── utils/            # Utility classes
├── pom.xml
└── HELP.md
```

### Frontend Structure
```text
Frontend-React/
├── src/
│   ├── pages/            # Home, Auth, Portfolio, Wallet, Watchlist, etc.
│   ├── Redux/            # Store configuration and domain slices
│   ├── components/       # Reusable and custom UI components
│   ├── Api/              # API configuration (Axios)
│   ├── Util/             # Utility functions
│   ├── assets/           # Images and static files
│   └── lib/              # Helper libraries
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 17 or higher | **Node.js**: v16 or higher | **MySQL**: 8.0 or higher | **Maven**: 3.6 or higher

### Backend Setup

1. **Clone the repository & Configure Database**
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/trading_platform
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

2. **Configure Payment Gateways & Email** (in `application.properties`)
   ```properties
   razorpay.key.id=your_razorpay_key
   stripe.api.key=your_stripe_key
   spring.mail.username=your_email
   ```

3. **Build and Run**
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```
   > The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Install dependencies & Configure API**
   ```bash
   cd "Frontend-React"
   npm install
   ```
   *Update `src/Api/api.js` with your backend URL if necessary.*

2. **Run development server**
   ```bash
   npm run dev
   ```
   > The frontend will start on `http://localhost:5173`

## 🔑 Environment Variables

<details>
<summary>Click to view required Environment Variables</summary>

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/trading_platform
spring.datasource.username=root
spring.datasource.password=password

# JWT
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000

# Payment Gateways
razorpay.key.id=your_razorpay_key_id
razorpay.key.secret=your_razorpay_secret
stripe.api.key=your_stripe_api_key

# Email & OAuth
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.security.oauth2.client.registration.google.client-id=your_google_client_id
```
</details>

## 📡 API Endpoints Summary

- **Auth**: `POST /auth/signup`, `POST /auth/signin`, `POST /auth/verify-otp`
- **User**: `GET /api/users/profile`, `PUT /api/users/profile`
- **Trading**: `POST /api/orders`, `GET /api/orders`
- **Wallet**: `GET /api/wallet`, `POST /api/wallet/deposit`, `POST /api/wallet/withdraw`
- **Payment**: `POST /api/payment/razorpay`, `POST /api/payment/stripe`

> See implementation for full list of endpoints including Watchlist and Coins.

## 🎨 UI Features

- 🌌 **Glassmorphism effects** with floating glass navbar
- 🔮 **Gradient backgrounds** with animated orbs
- ⚡ **Red/Cyan color theme** with vibrant aesthetics
- 📱 **Responsive design** for all screen sizes
- 🌙 **Dark mode** optimized interface

## 🧪 Testing & Build

```bash
# Backend Testing & Build
cd "Backend-Spring boot"
./mvnw test && ./mvnw clean package

# Frontend Linting & Build
cd "Frontend-React"
npm run lint && npm run build
```

## 🔒 Security Features

- **JWT Authentication** (Secure token-based authentication)
- **Password Encryption** (BCrypt password hashing)
- **2FA Support** (Two-factor authentication for enhanced security)
- **SQL Injection Prevention** (JPA/Hibernate parameterized queries)

## 🤝 Contributing & License

Contributions are welcome! Please fork the repository, create a feature branch, and submit a PR.
This project is licensed under the MIT License - see the LICENSE file for details.
