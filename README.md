# SemTUI Frontend

SemTUI's frontend provides users with a graphical user interface that engages them in human-in-the-loop processes to perform semantic enrichment of tabular data. This React-based application serves as the primary interface for the SemTUI (Semantic Tabular User Interface) system.

## Overview

SemTUI is a comprehensive tool for semantic enrichment of tabular data that combines automated processes with human expertise. The frontend application provides:

- **Interactive Data Visualization**: Explore and visualize tabular data in an intuitive interface
- **Semantic Annotation Tools**: Manually and automatically annotate data with semantic information
- **Human-in-the-Loop Workflows**: Guide users through refinement and validation processes
- **Real-time Collaboration**: Support for multiple users working on the same dataset
- **Integration Capabilities**: Seamless integration with knowledge bases and ontologies

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Styling**: SCSS with CSS Modules
- **HTTP Client**: Axios
- **Real-time Communication**: Socket.IO

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (version 20 or higher)
- **npm** (comes with Node.js)
- **Docker** (for containerized deployment)
- **Docker Compose** (for multi-container orchestration)

## Installation & Setup

### Option 1: Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/I2Tunimib/I2T-frontend.git
   cd I2T-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

   The application will be available at `http://localhost:3000`

### Option 2: Docker Setup (Recommended for Production)

#### Quick Start with Docker Compose

1. **Clone the repository**

   ```bash
   git clone https://github.com/I2Tunimib/I2T-frontend.git
   cd I2T-frontend
   ```

2. **Run with Docker Compose**

   ```bash
   docker-compose up
   ```

   The application will be available at `http://localhost:3000`

3. **Run in detached mode (background)**

   ```bash
   docker-compose up -d
   ```

4. **Stop the application**
   ```bash
   docker-compose down
   ```

#### Manual Docker Build

1. **Build the Docker image**

   ```bash
   docker build -t semtui-frontend .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:80 semtui-frontend
   ```

### Option 3: Production Build

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Serve the built application**
   ```bash
   npm run serve
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory to configure environment-specific settings:

```env
# Port for the development server
PORT=3000

# API endpoints (adjust according to your backend setup)
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SOCKET_URL=http://localhost:8000
```

### Docker Configuration

The Docker setup includes:

- **Multi-stage build**: Optimized for production with minimal image size
- **Nginx server**: Serves the built React application efficiently
- **Port configuration**: Customizable via environment variables

You can customize the port by setting the `PORT` environment variable:

```bash
PORT=8080 docker-compose up
```

## Available Scripts

- `npm start` - Start the development server with hot reload
- `npm run build` - Build the application for production
- `npm run serve` - Serve the production build locally

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── core/           # Basic UI components
│   ├── kit/            # Composite components
│   └── layout/         # Layout components
├── pages/              # Application pages/routes
├── hooks/              # Custom React hooks
├── services/           # API services and utilities
├── store/              # Redux store configuration
└── styles/             # Global styles and themes
```

## Development Workflow

1. **Start the development server**: `npm start`
2. **Make your changes** in the `src/` directory
3. **Test your changes** - the development server will automatically reload
4. **Build for production**: `npm run build`
5. **Test the production build**: `npm run serve`

## Docker Development

For development with Docker:

```bash
# Build and run in development mode
docker-compose -f docker-compose.yml up --build

# View logs
docker-compose logs -f

# Access the container shell
docker-compose exec server sh
```

## Integration with SemTUI Backend

This frontend is designed to work with the SemTUI backend services. Ensure that:

1. The backend API is running and accessible
2. Socket.IO connections are properly configured
3. CORS settings allow frontend-backend communication

## Documentation

- **Full Documentation**: [SemTUI Documentation](https://i2tunimib.github.io/I2T-docs/)
- **Setup Guide**: [How to Run](https://i2tunimib.github.io/I2T-docs/how-to-run)
- **API Documentation**: Available in the main documentation

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the terms specified in the LICENSE file.

## Support

For issues, questions, or contributions, please refer to the [main documentation](https://i2tunimib.github.io/I2T-docs/) or contact the development team.
