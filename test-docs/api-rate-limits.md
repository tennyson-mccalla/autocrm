# API Rate Limits

## Basic Limits
- Free tier: 60 requests per hour
- Pro tier: 1000 requests per hour
- Enterprise tier: Custom limits available

## Rate Limit Headers
All API responses include the following headers:
- `X-RateLimit-Limit`: Total requests allowed per hour
- `X-RateLimit-Remaining`: Remaining requests for the current hour
- `X-RateLimit-Reset`: UTC timestamp when the limit resets

## Handling Rate Limits
When you exceed your rate limit:
1. Response will have status code 429 (Too Many Requests)
2. Response includes `Retry-After` header
3. Exponential backoff is recommended

## Best Practices
- Cache responses when possible
- Use bulk endpoints for multiple operations
- Implement retry logic with backoff
- Monitor your usage via dashboard

## Increasing Limits
- Upgrade to a higher tier
- Contact support for custom limits
- Enterprise customers can request burst capacity

## Rate Limit by Endpoint
| Endpoint | Method | Free Tier | Pro Tier |
|----------|---------|-----------|-----------|
| /users | GET | 30/hr | 500/hr |
| /orders | POST | 10/hr | 200/hr |
| /products | GET | 50/hr | 800/hr |
