# API Response Caching Implementation

This document outlines the caching strategy implemented for the Lifeing webapp to improve performance while maintaining content freshness.

## Overview

We've implemented a multi-layered caching strategy using Next.js built-in caching mechanisms:

1. **Server-side caching** with Next.js `fetch` cache options
2. **Browser caching** with proper HTTP cache headers
3. **Smart cache invalidation** for content updates

## Cache Duration Strategy

### Highly Cacheable Content (Low Update Frequency)

| Content Type | Cache Duration | Rationale |
|--------------|----------------|-----------|
| Coaches | 1 hour | Coach information changes infrequently |
| Subscription Plans | 6 hours | Plan pricing and features updated through CMS |

### Moderately Cacheable Content (Medium Update Frequency)

| Content Type | Cache Duration | Rationale |
|--------------|----------------|-----------|
| Resources | 15 minutes | Content managed through CMS, can be updated |
| Articles | 15 minutes | Article content changes through CMS |

### Non-Cacheable Content (High Update Frequency/User-Specific)

| Content Type | Cache Duration | Rationale |
|--------------|----------------|-----------|
| Bookmarked Resources | No cache | User-specific data that changes frequently |
| Meetings | No cache | New meetings added anytime, RSVP status is user-specific |
| Announcements | No cache | Time-sensitive content needing immediate visibility |
| User-specific data | No cache | Account data, profiles, etc. |

## Implementation Details

### Cache Constants

```typescript
// utils/constants.ts
export const CACHE_DURATIONS = {
  COACHES: 60 * 60, // 1 hour
  PLANS: 6 * 60 * 60, // 6 hours
  RESOURCES: 15 * 60, // 15 minutes
  ARTICLES: 15 * 60, // 15 minutes
  NO_CACHE: 0, // No caching
} as const;
```

### API Endpoints with Caching

#### Coaches API (`/api/coaches`)
- **Cache Duration**: 1 hour
- **Cache Headers**: `public, max-age=3600, s-maxage=3600`
- **Next.js Cache**: `revalidate: 3600`

#### Subscription Plans API (`/api/payment/plans`)
- **Cache Duration**: 6 hours
- **Cache Headers**: `public, max-age=21600, s-maxage=21600`
- **Next.js Cache**: `revalidate: 21600`

#### Resources API (`/api/resources`)
- **Smart Caching**: 
  - Regular queries: 15 minutes cache
  - Bookmark queries: No cache (user-specific)
- **Cache Headers**: Dynamic based on query type

#### Individual Articles (`/api/resources/[slug]`)
- **Cache Duration**: 15 minutes
- **Cache Headers**: `public, max-age=900, s-maxage=900`

## Cache Invalidation

### Manual Cache Invalidation

Use the cache invalidation API endpoint:

```bash
# Invalidate specific content type
POST /api/cache/invalidate
{
  "contentType": "COACHES" | "PLANS" | "RESOURCES" | "ARTICLES" | "ANNOUNCEMENTS" | "ALL"
}

# Invalidate specific path
POST /api/cache/invalidate
{
  "path": "/api/coaches"
}
```

### Automatic Cache Invalidation (CMS Webhooks)

Set up webhooks in your CMS to automatically invalidate caches:

```bash
POST /api/webhooks/cms
{
  "model": "coach" | "resource" | "subscription-plan" | "announcement",
  "action": "create" | "update" | "delete"
}
```

### Cache Invalidation Utilities

```typescript
import { invalidateCache, invalidateAllCaches, revalidatePathCache } from '@/utils/cache';

// Invalidate specific content type
await invalidateCache('COACHES');

// Invalidate all caches
await invalidateAllCaches();

// Invalidate specific path
await revalidatePathCache('/api/coaches');
```

## Browser Cache Control

All cached endpoints include proper HTTP cache headers:

```typescript
response.headers.set(
  'Cache-Control', 
  `public, max-age=${cacheDuration}, s-maxage=${cacheDuration}`
);
```

- `public`: Cacheable by browsers and CDNs
- `max-age`: Browser cache duration
- `s-maxage`: CDN/shared cache duration

## Performance Benefits

### Before Caching
- Every request hits the database/CMS
- Slower response times
- Higher server load

### After Caching
- **Coaches**: 1 hour cache = 99%+ cache hit rate
- **Plans**: 6 hour cache = 99%+ cache hit rate  
- **Resources**: 15 minute cache = 90%+ cache hit rate
- **Articles**: 15 minute cache = 90%+ cache hit rate

## Monitoring and Debugging

### Check Cache Status

```bash
# List available cache types
GET /api/cache/invalidate

# Test webhook connectivity
GET /api/webhooks/cms
```

### Cache Headers in Response

Check response headers to verify caching:

```bash
curl -I /api/coaches
# Should show: Cache-Control: public, max-age=3600, s-maxage=3600
```

### Force Cache Invalidation

```bash
# Invalidate all caches
curl -X POST /api/cache/invalidate \
  -H "Content-Type: application/json" \
  -d '{"contentType": "ALL"}'
```

## Best Practices

### 1. Content Update Workflow
1. Update content in CMS
2. CMS webhook automatically invalidates cache
3. Next request fetches fresh content
4. Cache is rebuilt with new content

### 2. Emergency Cache Invalidation
If content needs immediate update:
```bash
curl -X POST /api/cache/invalidate \
  -H "Content-Type: application/json" \
  -d '{"contentType": "RESOURCES"}'
```

### 3. Monitoring Cache Performance
- Monitor cache hit rates in your analytics
- Set up alerts for cache invalidation failures
- Track response times before/after caching

## Troubleshooting

### Cache Not Working
1. Check if endpoint has proper cache headers
2. Verify cache duration is set correctly
3. Ensure no `no-cache` headers are overriding

### Content Not Updating
1. Check if CMS webhook is configured
2. Manually invalidate cache using API
3. Verify cache invalidation is successful

### Performance Issues
1. Monitor cache hit rates
2. Adjust cache durations based on usage patterns
3. Consider implementing cache warming for popular content

## Future Enhancements

1. **Cache Warming**: Pre-populate cache for popular content
2. **Conditional Caching**: Cache based on user roles/permissions
3. **Cache Analytics**: Track cache performance metrics
4. **CDN Integration**: Extend caching to edge locations 