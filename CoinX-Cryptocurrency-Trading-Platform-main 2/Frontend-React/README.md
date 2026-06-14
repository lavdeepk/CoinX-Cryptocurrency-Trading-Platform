# 📈 CoinX - Cryptocurrency Trading Platform

A full-stack cryptocurrency trading platform similar to Binance, built with **Spring Boot** backend and **React** frontend. This application provides real-time trading capabilities, wallet management, portfolio tracking, and secure payment processing.

---

## 🌟 Features

### 🔐 Authentication & Security
- JWT-based authentication with Spring Security
- OAuth2 client integration for social login
- Two-factor authentication (2FA) support
- Secure password encryption and validation

### 💰 Trading & Portfolio Management
- Real-time cryptocurrency price tracking
- Buy/sell cryptocurrency with live market data
- Portfolio overview with profit/loss calculations
- Watchlist functionality for favorite coins
- Order management (market, limit orders)
- Trading activity history

### 💳 Wallet & Payments
- Multi-currency wallet support
- Deposit and withdrawal functionality
- Payment gateway integration:
  - Razorpay
  - Stripe
- Transaction history tracking
- Secure payment processing

### 📊 Analytics & Visualization
- Interactive charts using ApexCharts and Recharts
- Real-time price graphs
- Portfolio performance analytics
- Market trends visualization

### 👤 User Management
- User profile management
- Account verification
- Email notifications
- Admin panel for withdrawals and user management

---

## 🛠️ Technology Stack

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.2.4
- **Language**: Java 17/19
- **Database**: MySQL
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **Key Dependencies**:
  - Spring Data JPA
  - Spring Security
  - Spring Validation
  - Spring Mail
  - Spring OAuth2 Client
  - Lombok
  - JWT (jjwt 0.11.1)
  - Razorpay Java SDK
  - Stripe Java SDK
  - JSON Path

### Frontend (React)
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **UI Library**: Radix UI Components
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: Redux + Redux Thunk
- **Routing**: React Router DOM 6.21.3
- **Charts**: ApexCharts, Recharts
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Yup/Zod validation
- **Key Dependencies**:
  - Radix UI (Avatar, Dialog, Dropdown, Select, Toast, etc.)
  - Lucide React (Icons)
  - Class Variance Authority
  - Tailwind Merge
  - Input OTP

---

## 📁 Project Structure

### Backend Structure
```
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
```
Frontend-React/
├── src/
│   ├── pages/
│   │   ├── Home/         # Landing page
│   │   ├── Auth/         # Login/Register
│   │   ├── Portfolio/    # Portfolio overview
│   │   ├── StockDetails/ # Coin details & trading
│   │   ├── Wallet/       # Wallet management
│   │   ├── Watchlist/    # Favorite coins
│   │   ├── Activity/     # Trading history
│   │   ├── Profile/      # User profile
│   │   ├── Search/       # Search coins
│   │   ├── Navbar/       # Navigation bar
│   │   ├── SideBar/      # Side navigation
│   │   ├── Footer/       # Footer component
│   │   └── Notfound/     # 404 page
│   ├── Redux/
│   │   ├── Store.js      # Redux store configuration
│   │   ├── Auth/         # Authentication state
│   │   ├── Coin/         # Coin data state
│   │   ├── Wallet/       # Wallet state
│   │   ├── Order/        # Order state
│   │   ├── Watchlist/    # Watchlist state
│   │   ├── Withdrawal/   # Withdrawal state
│   │   ├── Assets/       # Assets state
│   │   └── Chat/         # Chat state
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   └── custome/      # Custom components
│   ├── Api/
│   │   └── api.js        # API configuration
│   ├── Util/             # Utility functions
│   ├── assets/           # Images and static files
│   └── lib/              # Helper libraries
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 17 or higher
- **Node.js**: v16 or higher
- **MySQL**: 8.0 or higher
- **Maven**: 3.6 or higher
- **npm** or **yarn**

### Backend Setup

1. **Clone the repository**
   ```bash
   cd "Backend-Spring boot"
   ```

2. **Configure MySQL Database**
   
   Create a database and update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/trading_platform
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Configure Payment Gateways**
   
   Add your API keys in `application.properties`:
   ```properties
   # Razorpay
   razorpay.key.id=your_razorpay_key
   razorpay.key.secret=your_razorpay_secret
   
   # Stripe
   stripe.api.key=your_stripe_key
   ```

4. **Configure Email Service**
   ```properties
   spring.mail.host=smtp.gmail.com
   spring.mail.port=587
   spring.mail.username=your_email
   spring.mail.password=your_app_password
   ```

5. **Build and Run**
   ```bash
   # Using Maven wrapper
   ./mvnw clean install
   ./mvnw spring-boot:run
   
   # Or using Maven
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd "Frontend-React"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Update `src/Api/api.js` with your backend URL:
   ```javascript
   const API_BASE_URL = 'http://localhost:8080';
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

---

## 🔑 Environment Variables

### Backend (.env or application.properties)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/trading_platform
spring.datasource.username=root
spring.datasource.password=password

# JWT
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000

# Razorpay
razorpay.key.id=your_razorpay_key_id
razorpay.key.secret=your_razorpay_secret

# Stripe
stripe.api.key=your_stripe_api_key

# Email
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password

# OAuth2 (if using)
spring.security.oauth2.client.registration.google.client-id=your_google_client_id
spring.security.oauth2.client.registration.google.client-secret=your_google_client_secret
```

---

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - User login
- `POST /auth/verify-otp` - Verify 2FA OTP

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Coins
- `GET /api/coins` - Get all coins
- `GET /api/coins/{id}` - Get coin details
- `GET /api/coins/search` - Search coins

### Trading
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user orders
- `GET /api/orders/{id}` - Get order details

### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Get transaction history

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist/{coinId}` - Add to watchlist
- `DELETE /api/watchlist/{coinId}` - Remove from watchlist

### Payment
- `POST /api/payment/razorpay` - Create Razorpay order
- `POST /api/payment/stripe` - Create Stripe payment

---

## 🎨 UI Features

### Modern Design
- **Glassmorphism effects** with floating glass navbar
- **Gradient backgrounds** with animated orbs
- **Red/Cyan color theme** with vibrant aesthetics
- **Responsive design** for all screen sizes
- **Dark mode** optimized interface

### Interactive Components
- Real-time price updates
- Smooth animations and transitions
- Toast notifications for user actions
- Modal dialogs for confirmations
- Dropdown menus and select components
- Scroll areas for long lists
- Avatar components for user profiles

---

## 🧪 Testing

### Backend Tests
```bash
cd "Backend-Spring boot"
./mvnw test
```

### Frontend Linting
```bash
cd "Frontend-React"
npm run lint
```

---

## 📦 Build & Deployment

### Backend Production Build
```bash
cd "Backend-Spring boot"
./mvnw clean package
java -jar target/treading-plateform-0.0.1-SNAPSHOT.jar
```

### Frontend Production Build
```bash
cd "Frontend-React"
npm run build
# Output will be in the 'dist' folder
```

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: BCrypt password hashing
- **CORS Configuration**: Controlled cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: JPA/Hibernate parameterized queries
- **XSS Protection**: React's built-in XSS protection
- **2FA Support**: Two-factor authentication for enhanced security

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Himanshu**

- GitHub: [@himanshu](https://github.com/himanshu)
- LinkedIn: [Himanshu](https://linkedin.com/in/himanshu)
- LeetCode: [Himanshu](https://leetcode.com/himanshu)

---

## 🙏 Acknowledgments

- Spring Boot Documentation
- React Documentation
- Radix UI Components
- Tailwind CSS
- ApexCharts & Recharts
- Razorpay & Stripe APIs

---

## 📞 Support

For support, email your_email@example.com or create an issue in the repository.

---

## 🗺️ Roadmap

- [ ] Add WebSocket support for real-time price updates
- [ ] Implement advanced charting features
- [ ] Add more cryptocurrency exchanges integration
- [ ] Mobile app development (React Native)
- [ ] Advanced trading features (stop-loss, take-profit)
- [ ] Social trading features
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

---

**⭐ If you find this project useful, please consider giving it a star!**
