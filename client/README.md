# Reverse Proxy Logger - Frontend

A modern React TypeScript frontend for the MERN Reverse Proxy Logging System, built with shadcn/ui components.

## Features

- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Authentication**: Secure login/logout with role-based access control
- **Dashboard**: Real-time statistics and analytics
- **Logs Management**: View, filter, and search request logs
- **Proxy Rules**: Manage proxy routing and filtering rules (Admin only)
- **User Management**: Create and manage system users (Admin only)
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running (see server README)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MERN-Reverse-Proxy-Logging-System/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the client directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── ...             # Other components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── dashboard/      # Dashboard page
│   ├── login/          # Login page
│   ├── logs/           # Logs page
│   ├── proxy-rules/    # Proxy rules page
│   ├── users/          # Users page
│   └── settings/       # Settings page
├── services/           # API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Authentication
- Login with username/password
- Role-based access control (Admin/User)
- Automatic token management
- Protected routes

### Dashboard
- Real-time statistics
- Request activity charts
- Status code distribution
- Performance metrics

### Logs Management
- View all proxy requests
- Filter by method, status, date
- Search functionality
- Detailed log information
- Export capabilities

### Proxy Rules (Admin Only)
- Create, edit, delete proxy rules
- Configure routing patterns
- Set HTTP methods
- Enable/disable logging
- Block/allow requests
- Priority management

### User Management (Admin Only)
- Create new users
- Assign roles (Admin/User)
- Edit user information
- Delete users

### Settings
- System configuration
- Security settings
- Proxy behavior
- Database settings

## API Integration

The frontend communicates with the backend through RESTful APIs:

- **Authentication**: `/api/auth`
- **Logs**: `/api/logs`
- **Proxy Rules**: `/api/proxy-rule`
- **Users**: `/api/users`
- **Proxy Status**: `/api/proxy/status`

## Development

### Adding New Components

1. Create component in `src/components/`
2. Use shadcn/ui components when possible
3. Follow TypeScript best practices
4. Add proper prop types and documentation

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation if needed
4. Add proper authentication guards

### Styling

- Use Tailwind CSS classes
- Follow the existing design system
- Use shadcn/ui components as base
- Maintain responsive design

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Environment Variables

For production, set the following environment variables:

```env
VITE_API_URL=https://your-api-domain.com/api
```

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper error handling
4. Test your changes thoroughly
5. Update documentation as needed

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check if backend server is running
   - Verify `VITE_API_URL` environment variable
   - Check CORS configuration on backend

2. **Authentication Issues**
   - Clear browser localStorage
   - Check token expiration
   - Verify user credentials

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

## License

This project is part of the MERN Reverse Proxy Logging System.
