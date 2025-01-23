# AutoCRM

A modern customer relationship management system built with Next.js and Supabase.

## Features

- 🎫 **Ticket Management**: Create and track support tickets
- 👥 **Role-Based Access**: Different views for customers and workers
- 🔒 **Secure Authentication**: Built-in authentication with Supabase
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AutoCRM.git
cd AutoCRM
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm test tests/features/ticket-listing.test.tsx
npm test tests/api/ticket-creation.test.ts
```

## Project Structure

```
AutoCRM/
├── src/
│   ├── components/    # React components
│   ├── contexts/      # Context providers
│   ├── lib/          # Utility functions and API
│   └── pages/        # Next.js pages
├── tests/
│   ├── api/          # API tests
│   ├── features/     # Feature tests
│   └── mocks/        # Test mocks
└── docs/            # Documentation
```

## Documentation

- [Ticket Creation & Customer Interface](docs/ticket_creation_customer_interface.md)

## Screenshots

### Ticket Creation Form
![Ticket Creation Form](docs/images/ticket-creation-form.png)

### Ticket Listing
![Ticket Listing](docs/images/ticket-listing.png)

## Future Enhancements

1. **Authentication Improvements**
   - Password reset functionality
   - Email verification
   - Session refresh mechanism
   - Rate limiting for auth endpoints

2. **Ticket System Enhancements**
   - File attachments for tickets
   - Ticket categories/tags
   - Ticket assignment to specific workers
   - SLA tracking and notifications
   - Ticket status change history

3. **User Experience**
   - Real-time updates for ticket status changes
   - Email notifications for ticket updates
   - Rich text editor for ticket descriptions
   - Ticket search and advanced filtering
   - Bulk actions for tickets

4. **Admin Features**
   - User management dashboard
   - System-wide analytics
   - Custom ticket fields configuration
   - Role and permission management
   - Audit logging

5. **Integration Possibilities**
   - Slack/Discord notifications
   - Calendar integration for scheduling
   - Knowledge base integration
   - Customer satisfaction surveys
   - Export functionality for reporting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
