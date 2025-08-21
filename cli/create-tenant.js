#!/usr/bin/env node

const { program } = require('commander');
const bcrypt = require('bcryptjs');
const knex = require('knex');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Initialize database connection
const db = knex({
  client: process.env.DB_CLIENT || 'mysql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_db'
  }
});

program
  .version('1.0.0')
  .description('CLI tool to create new tenants with admin users')
  .requiredOption('-n, --name <name>', 'Tenant name')
  .requiredOption('-d, --domain <domain>', 'Custom domain')
  .requiredOption('-f, --fullname <fullname>', 'Admin full name')
  .requiredOption('-u, --username <username>', 'Admin username')
  .requiredOption('-e, --email <email>', 'Admin email')
  .requiredOption('-p, --password <password>', 'Admin password')
  .option('-g, --department <department>', 'Admin department/group', 'Administration')
  .option('-l, --logo <logo>', 'Tenant logo URL/path')
  .parse(process.argv);

const options = program.opts();

async function createTenantWithAdmin() {
  try {
    console.log('Starting tenant creation process...');
    
    // Check if tenant with same domain already exists
    const existingTenant = await db('tenants')
      .where({ domain: options.domain })
      .first();
    
    if (existingTenant) {
      console.error(`Error: Tenant with domain "${options.domain}" already exists.`);
      process.exit(1);
    }

    // Check if admin user with same email already exists
    const existingUser = await db('users')
      .where({ email: options.email })
      .first();
    
    if (existingUser) {
      console.error(`Error: User with email "${options.email}" already exists.`);
      process.exit(1);
    }

    // Check if admin user with same username already exists
    const existingUsername = await db('users')
      .where({ username: options.username })
      .first();
    
    if (existingUsername) {
      console.error(`Error: User with username "${options.username}" already exists.`);
      process.exit(1);
    }

    // Start transaction to ensure both tenant and user are created
    await db.transaction(async (trx) => {
      // 1. Create tenant
      console.log('Creating tenant record...');
      const [tenantId] = await trx('tenants')
        .insert({
          name: options.name,
          domain: options.domain,
          logo: options.logo || null,
          status: 'active',
          created_at: new Date()
        });

      console.log(`Tenant created with ID: ${tenantId}`);

      // 2. Hash password
      console.log('Hashing password...');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(options.password, saltRounds);

      // 3. Create admin user
      console.log('Creating admin user...');
      await trx('users')
        .insert({
          tenant_id: tenantId,
          full_name: options.fullname,
          username: options.username,
          email: options.email,
          password: hashedPassword,
          role: 'admin',
          department_group: options.department,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });

      console.log('Admin user created successfully.');
    });

    console.log('✅ Tenant and admin user created successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Tenant Name: ${options.name}`);
    console.log(`   Domain: ${options.domain}`);
    console.log(`   Admin Name: ${options.fullname}`);
    console.log(`   Admin Email: ${options.email}`);
    console.log(`   Admin Username: ${options.username}`);
    console.log(`   Department: ${options.department}`);
    
    if (options.logo) {
      console.log(`   Logo: ${options.logo}`);
    }
    
    console.log('\n💡 Next steps:');
    console.log('   1. Configure DNS for the custom domain');
    console.log('   2. Set up SSL certificate for the domain');
    console.log('   3. Test login with the admin credentials');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tenant and admin user:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    try {
      await db.destroy();
    } catch (error) {
      console.error('Error closing database connection:', error.message);
    }
  }
}

// Handle command line arguments
if (require.main === module) {
  createTenantWithAdmin();
}

module.exports = { createTenantWithAdmin };

