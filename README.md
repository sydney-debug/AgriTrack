# AgriTrack - Farm Management System

A comprehensive web-based farm management system built with Node.js, Express, Supabase, and vanilla JavaScript.

## Features

### Role-Based Access Control
- **Farmers**: Manage farms, crops, livestock, health records, sales, inventory, and more
- **Veterinarians**: View assigned farms, manage animal health records, track pregnancies
- **Agrovets**: Manage marketplace listings, view inquiries, and analytics

### Core Features

#### For Farmers:
- **Farm Management**: Track multiple farms with locations and descriptions
- **Crop Management**: Monitor crops with planting/harvest dates, yields, and status
- **Livestock Management**: Track animals with ID tags, breeds, health status, and more
- **Health Records**: Log vaccinations, illnesses, treatments, and vet visits
- **Sales Tracking**: Record all sales with detailed information and generate reports
- **Inventory Management**: Track feed, supplements, and medications with consumption logs
- **Pregnancies & Calves**: Monitor pregnancies and record calf births
- **Marketplace**: Browse and purchase agricultural products
- **Reports**: Export data to CSV for analysis

#### For Veterinarians:
- **Farm Access**: View farms they're invited to
- **Health Management**: Add and update health records for animals
- **Pregnancy Monitoring**: Track and update pregnancy status
- **Notebook**: Keep private notes for each farm

#### For Agrovets (Suppliers):
- **Product Listings**: Create and manage product listings with images
- **Pricing**: Set prices with discount options (percentage or fixed)
- **Inventory**: Track stock levels
- **Inquiries**: Receive and respond to customer inquiries
- **Analytics**: View listing performance and engagement metrics

## Technology Stack

### Backend:
- Node.js
- Express.js
- Supabase (PostgreSQL + Auth + Storage)
- Joi (validation)
- Helmet (security)
- Multer (file uploads)

### Frontend:
- HTML5
- CSS3 (with Bootstrap 5)
- Vanilla JavaScript
- Leaflet.js (maps)
- Font Awesome (icons)

### Database:
- PostgreSQL (via Supabase)
- Row Level Security (RLS) for data protection

## 🔑 **Supabase Setup**

### **⚠️ IMPORTANT: Update API Key**

The current Supabase API key has expired. To fix the authentication errors:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/txgkmhjumamvcavvsolp/settings/api
2. **Copy the fresh API key** from the "Project API keys" section
3. **Update the configuration** in `frontend/js/config.js`:
   ```javascript
   SUPABASE_ANON_KEY: 'YOUR_FRESH_API_KEY_HERE'
   ```

### **Database Setup**

1. **Run the database schema** in your Supabase SQL Editor:
   ```bash
   # Copy and paste the contents of database/schema.sql
   ```

2. **Verify RLS policies** are enabled for all tables

### **Authentication Setup**

1. **Enable email authentication** in Supabase Auth settings
2. **Configure email templates** for signup verification
3. **Test the connection** by trying to login

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- A Supabase account and project
- Git

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd AgriTrack
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the entire contents of `database/schema.sql`
4. Execute the SQL script to create all tables, policies, and triggers
5. Go to Project Settings > API to get your:
   - Project URL
   - `anon` public key
   - `service_role` secret key (keep this secure!)

### Step 3: Configure Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Supabase credentials:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080
```

5. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# OR Production mode
npm start
```

The API will be running at `http://localhost:3000`

### Step 4: Configure Frontend

1. Open `frontend/js/config.js` in a text editor

2. Update the configuration:
```javascript
const CONFIG = {
    API_URL: 'http://localhost:3000/api',
    SUPABASE_URL: 'your_supabase_project_url',
    SUPABASE_ANON_KEY: 'your_supabase_anon_key',
    // ...
};
```

3. Serve the frontend (choose one method):

**Option A: Using Python's built-in server:**
```bash
cd frontend
python -m http.server 8080
```

**Option B: Using Node.js http-server:**
```bash
npm install -g http-server
cd frontend
http-server -p 8080
```

**Option C: Using Live Server (VS Code extension):**
- Install the "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

4. Open your browser and navigate to `http://localhost:8080`

## Usage

### First-Time Setup

1. **Create an Account**:
   - Click "Sign Up" on the landing page
   - Fill in your details
   - Select your role (Farmer, Vet, or Agrovets)
   - Create your account

2. **Login**:
   - Use your email and password to log in
   - You'll be redirected to your role-specific dashboard

### For Farmers:

1. **Add Your First Farm**:
   - Go to "My Farms"
   - Click "Add New Farm"
   - Enter farm details (name, location, coordinates optional)
   - Save

2. **Add Livestock**:
   - Go to "Livestock"
   - Click "Add New Animal"
   - Fill in animal details
   - Save

3. **Track Health**:
   - Go to "Health Records"
   - Add vaccinations, treatments, or checkups
   - Link records to specific animals

4. **Record Sales**:
   - Go to "Sales"
   - Click "Record Sale"
   - Enter product details, quantity, price
   - Track payment status

5. **Manage Inventory**:
   - Go to "Inventory"
   - Add feed, supplements, or medications
   - Set reorder levels for alerts
   - Log consumption as you use items

6. **Invite Vets**:
   - Go to "Farm Invitations"
   - Enter the vet's email address
   - They'll receive an invitation to access your farm data

7. **Browse Marketplace**:
   - Go to "Marketplace"
   - Search for products
   - Contact sellers directly

### For Veterinarians:

1. **Accept Farm Invitations**:
   - Go to "Farm Invitations"
   - Review pending invitations
   - Accept to gain access to farm data

2. **View Associated Farms**:
   - Go to "Associated Farms"
   - See all farms you have access to

3. **Update Health Records**:
   - Select a farm
   - View livestock
   - Add or update health records

4. **Track Pregnancies**:
   - Go to "Pregnancies"
   - View active pregnancies
   - Update status and add notes

### For Agrovets (Suppliers):

1. **Add Products**:
   - Go to "My Listings"
   - Click "Add New Product"
   - Enter product details, price, stock
   - Add discounts if applicable
   - Save

2. **Manage Listings**:
   - View all your products
   - Edit prices and stock levels
   - Mark products as sold out or inactive

3. **Respond to Inquiries**:
   - Go to "Inquiries"
   - View customer messages
   - Contact customers directly via email/phone

4. **View Analytics**:
   - Go to "Analytics"
   - See total views, inquiries
   - Track performance by category

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Farms
- `GET /api/farms` - Get all farms
- `GET /api/farms/:id` - Get farm by ID
- `POST /api/farms` - Create farm
- `PUT /api/farms/:id` - Update farm
- `DELETE /api/farms/:id` - Delete farm

### Crops
- `GET /api/crops` - Get all crops
- `POST /api/crops` - Create crop
- `PUT /api/crops/:id` - Update crop
- `DELETE /api/crops/:id` - Delete crop

### Livestock
- `GET /api/livestock` - Get all livestock
- `POST /api/livestock` - Create livestock
- `PUT /api/livestock/:id` - Update livestock
- `DELETE /api/livestock/:id` - Delete livestock

### Health Records
- `GET /api/health-records` - Get all health records
- `POST /api/health-records` - Create health record
- `PUT /api/health-records/:id` - Update health record
- `DELETE /api/health-records/:id` - Delete health record

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale
- `GET /api/sales/reports/summary` - Get sales summary

### Inventory
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `POST /api/inventory/:id/consumption` - Log consumption

### Pregnancies
- `GET /api/pregnancies` - Get all pregnancies
- `POST /api/pregnancies` - Create pregnancy record
- `PUT /api/pregnancies/:id` - Update pregnancy
- `DELETE /api/pregnancies/:id` - Delete pregnancy
- `GET /api/pregnancies/calves/all` - Get all calves
- `POST /api/pregnancies/calves` - Record calf birth

### Marketplace
- `GET /api/marketplace/listings` - Get all listings
- `GET /api/marketplace/listings/:id` - Get listing by ID
- `POST /api/marketplace/listings` - Create listing (Agrovets only)
- `PUT /api/marketplace/listings/:id` - Update listing
- `DELETE /api/marketplace/listings/:id` - Delete listing
- `POST /api/marketplace/inquiries` - Create inquiry (Farmers only)
- `GET /api/marketplace/inquiries` - Get inquiries
- `GET /api/marketplace/analytics` - Get analytics (Agrovets only)

### Farm-Vet Associations
- `GET /api/farm-vet-associations` - Get all associations
- `POST /api/farm-vet-associations/invite` - Invite vet
- `PUT /api/farm-vet-associations/:id/respond` - Respond to invitation
- `DELETE /api/farm-vet-associations/:id` - Remove association

## Security Features

- **JWT Authentication**: Secure token-based authentication via Supabase
- **Row Level Security (RLS)**: Database-level access control
- **Role-Based Access Control**: Different permissions for each user role
- **Input Validation**: Server-side validation using Joi
- **Rate Limiting**: API request throttling
- **CORS Protection**: Controlled cross-origin requests
- **Helmet.js**: Security headers
- **SQL Injection Prevention**: Parameterized queries via Supabase

## Database Schema

The application uses the following main tables:
- `users` - User accounts with roles
- `farms` - Farm information
- `crops` - Crop tracking
- `livestock` - Animal records
- `health_records` - Health tracking
- `sales` - Sales transactions
- `inventory` - Feed and supplies
- `pregnancies` - Pregnancy tracking
- `calves` - Birth records
- `marketplace_listings` - Product listings
- `marketplace_inquiries` - Customer inquiries
- `farm_vet_associations` - Farm-vet relationships

## Deployment

### Backend Deployment (Render/Heroku):

1. Create a new web service
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify):

1. Create a new site
2. Connect your repository
3. Set build directory to `frontend`
4. Deploy

### Database (Supabase):
- Already hosted in the cloud
- No additional setup needed

## Troubleshooting

### Backend won't start:
- Check `.env` file exists and has correct values
- Ensure all dependencies are installed (`npm install`)
- Verify Supabase credentials are correct

### Database errors:
- Ensure `schema.sql` was executed successfully
- Check RLS policies are enabled
- Verify user role is set correctly in the users table

### Frontend can't connect to backend:
- Check `config.js` has correct API URL
- Ensure CORS is configured correctly in backend
- Verify backend server is running

### Authentication issues:
- Clear browser localStorage
- Check Supabase Auth is enabled in dashboard
- Verify email confirmation settings

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team

## Future Enhancements

- Mobile app (React Native)
- Weather integration
- Soil analysis tracking
- Financial reports and forecasting
- Multi-language support
- Offline mode with sync
- Push notifications
- Equipment maintenance tracking
- Task scheduling and reminders

## Acknowledgments

- Bootstrap for UI components
- Font Awesome for icons
- Leaflet.js for mapping
- Supabase for backend infrastructure
- The open-source community

---

**Built with ❤️ for farmers, veterinarians, and agricultural professionals**
