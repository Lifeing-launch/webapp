# Lifeing Webapp - Deployment Guide

This guide covers the deployment process for the Lifeing Webapp using the Vercel platform. Our setup includes automated deployments from GitHub with separate staging and production environments.

## Overview

The Lifeing Webapp is deployed on [Vercel](https://vercel.com), a modern cloud platform optimized for Next.js applications that provides:
- Automatic builds and deployments from Git
- Environment-based configuration management  
- SSL certificates and custom domains
- Built-in monitoring and performance analytics
- Edge function support

## Project Structure on Vercel

### Project: "webapp"
We use a single Vercel project connected to our webapp repository. Our setup includes:

**Branch-based Environments:**
- **Production**: Main branch serves the live application
- **Staging**: Staging branch serves the pre-production environment
- **Preview**: All other branches get automatic preview deployments

**Reference:** [Vercel Projects Documentation](https://vercel.com/docs/projects)

### Project Configuration

#### Repository Setup
- **Project Name:** `webapp`
- **Repository:** Connected to the webapp git repository
- **Framework:** Next.js (auto-detected)
- **Root Directory:** `/` (root of repository)
- **Auto-deploy:** Enabled for all branches

#### URLs and Domains

**Production Environment (main branch):**
- Primary: https://webapp-lifeing.vercel.app
- Custom Domain: https://lifeing.services

**Staging Environment (staging branch):**
- Primary: https://webapp-git-staging-lifeing.vercel.app  
- Custom Domain: https://staging.lifeing.services

**Preview Environments (feature branches):**
- Format: https://webapp-git-[branch-name]-lifeing.vercel.app
- Useful for reviewing pull requests and feature development

## Deployment Configuration

### Automatic Deployments

Vercel automatically deploys when:

1. **Push to main branch** → Triggers production deployment
2. **Push to staging branch** → Triggers staging deployment  
3. **Push to any other branch** → Triggers preview deployment
4. **Pull request created/updated** → Updates preview deployment

### Deployment Steps

When a deployment is triggered, Vercel:

1. **Pulls latest code** from the specified branch
2. **Installs dependencies** via `npm install`
3. **Builds the application** via `npm run build`
4. **Deploys to global edge network** with automatic CDN optimization
5. **Runs health checks** to ensure the deployment is successful

### Build Configuration

- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)
- **Runtime:** Node.js 18.x
- **Region:** Automatically optimized globally

## Environment Variables Setup

### Variable Environments

Vercel provides two environment targets:
- **Production**: Used for the main branch (production environment)
- **Preview**: Used for all other branches (staging and feature branches)

You can also target specific branches when setting preview environment variables.

### Required Variables

Each environment must have the following environment variables configured in the Vercel dashboard:

#### Site Configuration
- `NEXT_PUBLIC_SITE_URL`: The base URL for the current environment

#### Supabase Configuration
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous/publishable key
- `NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side)
- `EDGE_FUNCTION_API_KEY`: Custom API key for Edge Function authentication

#### Strapi CMS Configuration
- `STRAPI_BASE_URL`: Base URL of your Strapi CMS instance
- `STRAPI_API_TOKEN`: API token for accessing Strapi content

#### Stripe Configuration
- `STRIPE_SECRET_KEY`: Stripe secret key (server-side)
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key (client-side)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret

#### Cloudinary Configuration
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name

### Setting Environment Variables

1. **Access Vercel Dashboard** at [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Navigate to your webapp project**
3. **Go to Settings tab**
4. **Click on Environment Variables**
5. **Add/update environment variables:**
   - Select environment target (Production or Preview)
   - Optionally target specific branches for Preview variables
   - Add key-value pairs
6. **Save changes** - Vercel will automatically redeploy if needed

**Environment Targeting Examples:**
- Production variables: Apply only to main branch
- Preview variables: Apply to all non-production branches
- Branch-specific: Apply to specific branches (e.g., only staging branch)

**Reference:** [Vercel Environment Variables Documentation](https://vercel.com/docs/environment-variables)

## Deployment Workflow

### Staging Deployment

1. **Development:** Work on feature branches
2. **Integration:** Merge feature branches to `staging` branch
3. **Auto-deploy:** Vercel automatically deploys to staging environment
4. **Validation:** Test on https://staging.lifeing.services
5. **Quality Assurance:** Run tests and validate functionality
6. **Approval:** If tests pass, proceed to production

### Production Deployment

1. **Merge:** Merge `staging` branch to `main` branch
2. **Auto-deploy:** Vercel automatically deploys to production environment
3. **Monitoring:** Monitor https://lifeing.services for issues
4. **Verification:** Confirm all functionality works in production
5. **Rollback:** If needed, revert to previous commit and push

### Feature Branch Previews

1. **Create branch:** Create feature branch from main or staging
2. **Push changes:** Push commits to feature branch
3. **Auto-preview:** Vercel creates preview deployment automatically
4. **Review:** Share preview URL for stakeholder review
5. **Iterate:** Make changes and push - preview updates automatically
6. **Merge:** When ready, merge to staging for further testing

### Manual Deployment

If you need to deploy manually or redeploy:

1. **Access Vercel Dashboard**
2. **Navigate to the webapp project** 
3. **Go to Deployments tab**
4. **Click "Redeploy" on any previous deployment**
5. **Or trigger new deployment by pushing to repository**

## Monitoring & Analytics

### Access Deployment Logs

1. **Go to Vercel Dashboard**
2. **Select webapp project**
3. **Click on Deployments tab**
4. **Click on any deployment to view detailed logs**
5. **View build logs, function logs, and runtime logs**

### Performance Monitoring

Vercel provides built-in analytics:
- **Real User Monitoring (RUM)**: Core Web Vitals and performance metrics
- **Function Analytics**: Edge function performance and errors  
- **Traffic Analytics**: Visitor counts, top pages, referrers
- **Performance Insights**: Page load times, optimization suggestions

### Error Monitoring

- **Build Errors**: Displayed in deployment logs
- **Runtime Errors**: Available in function logs
- **Real-time Monitoring**: Automatic alerts for deployment failures
- **Integration**: Connect with external monitoring tools (Sentry, LogRocket, etc.)

## Custom Domains

### SSL Certificates
- Vercel automatically provides SSL certificates for all domains
- Both staging and production use HTTPS by default
- Certificates are renewed automatically

### Domain Configuration

**Production Domain (https://lifeing.services):**
1. Go to project Settings → Domains
2. Add custom domain: `lifeing.services`
3. Configure DNS to point to Vercel servers
4. Vercel handles SSL certificate provisioning

**Staging Domain (https://staging.lifeing.services):**
1. Add custom domain: `staging.lifeing.services`
2. Configure branch assignment to `staging` branch
3. Configure DNS to point to Vercel servers

**DNS Configuration:**
- Create CNAME record pointing to `cname.vercel-dns.com`
- Or create A record pointing to Vercel's IP addresses
- Vercel dashboard provides specific DNS instructions

## Troubleshooting

### Common Deployment Issues

1. **Build failures:**
   - Check build logs in Vercel dashboard
   - Verify package.json scripts and dependencies
   - Ensure all environment variables are set
   - Check for TypeScript errors or linting issues

2. **Environment variable issues:**
   - Verify all required variables are configured
   - Check variable names for typos
   - Ensure secrets are properly formatted
   - Confirm environment targeting (Production vs Preview)

3. **API route failures:**
   - Check function logs in Vercel dashboard
   - Verify serverless function configuration
   - Ensure database connections work in serverless environment
   - Check for cold start timeout issues

4. **Custom domain issues:**
   - Verify DNS configuration is correct
   - Check domain status in Vercel dashboard
   - Ensure SSL certificate has been provisioned
   - Wait for DNS propagation (up to 48 hours)

### Rollback Procedure

If a deployment causes issues:

1. **Immediate rollback via Vercel:**
   - Go to Vercel Dashboard → Deployments
   - Find previous working deployment
   - Click "Promote to Production" on that deployment

2. **Code rollback:**
   - Revert the problematic commit in Git
   - Push the revert to trigger new deployment
   - Or force push previous working commit

3. **Environment variable rollback:**
   - Revert environment variables to previous values
   - Redeploy to apply changes

### Performance Issues

1. **Slow page loads:**
   - Check Core Web Vitals in Vercel Analytics
   - Optimize images and assets
   - Review bundle size and code splitting
   - Consider implementing ISR (Incremental Static Regeneration)

2. **Function timeouts:**
   - Optimize API route performance
   - Check database query performance  
   - Consider implementing connection pooling
   - Review function execution time limits

3. **Build time issues:**
   - Optimize build process and dependencies
   - Consider build caching strategies
   - Review build command configuration
   - Monitor build performance metrics

## Security Considerations

### Environment Isolation
- Production and staging environments are completely isolated
- Separate databases, API keys, and external service configurations
- Independent environment variables and secrets

### Access Control
- Limit GitHub repository access to authorized team members
- Use Vercel team features for access management
- Regularly rotate secrets and API keys
- Review deployment permissions

### Network Security
- All connections use HTTPS/SSL automatically
- Vercel provides built-in DDoS protection
- API routes benefit from Vercel's edge network security
- Database connections should use SSL

## Maintenance

### Regular Tasks

1. **Monitor deployments:**
   - Review deployment success/failure rates
   - Check build performance and timing
   - Monitor for any recurring errors

2. **Update dependencies:**
   - Keep Next.js and dependencies updated
   - Test updates in staging before production
   - Monitor security advisories

3. **Performance optimization:**
   - Regular review of Core Web Vitals
   - Optimize images and assets
   - Review and optimize bundle sizes
   - Implement performance best practices

4. **Security maintenance:**
   - Rotate environment variables periodically
   - Update Stripe webhook endpoints as needed
   - Review and update API token permissions
   - Monitor for security vulnerabilities

### Best Practices

1. **Branch Management:**
   - Use feature branches for development
   - Keep staging branch stable and up-to-date
   - Only merge tested changes to main branch

2. **Environment Variables:**
   - Use different keys/tokens for each environment
   - Never expose sensitive variables in client-side code
   - Regularly audit and rotate secrets

3. **Testing:**
   - Test thoroughly in preview environments
   - Validate functionality in staging before production
   - Monitor production deployments closely

4. **Documentation:**
   - Keep deployment procedures documented
   - Document environment-specific configurations
   - Maintain runbooks for common issues

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Status Page](https://vercel-status.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions) 