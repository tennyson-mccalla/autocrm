-- Insert test documents
INSERT INTO documents (title, content, doc_type, metadata, user_id)
VALUES
(
    'Rate Limiting Guide',
    '# Rate Limiting in AutoCRM API

Rate limiting helps protect our API from abuse and ensures fair usage across all clients. This document explains our rate limiting policies and how to handle rate limit errors.

## Rate Limits

- Basic tier: 100 requests per minute
- Premium tier: 1000 requests per minute
- Enterprise tier: Custom limits based on needs

## Rate Limit Headers

Every API response includes these headers:
- X-RateLimit-Limit: Maximum requests per window
- X-RateLimit-Remaining: Remaining requests in current window
- X-RateLimit-Reset: Time when the rate limit resets (Unix timestamp)

## Handling Rate Limits

When you exceed the rate limit, the API returns:
- Status code: 429 Too Many Requests
- Response body: {"error": "Rate limit exceeded"}

Best practices:
1. Monitor the rate limit headers
2. Implement exponential backoff
3. Cache responses when possible
4. Distribute requests evenly

## Premium Features

Premium and Enterprise tiers include:
- Higher rate limits
- Priority queue processing
- Rate limit alerts
- Usage analytics

Contact sales for custom limits and enterprise features.',
    'api_doc',
    jsonb_build_object(
        'category', 'API Documentation',
        'tags', ARRAY['rate-limiting', 'api', 'quotas'],
        'version', '1.0'
    ),
    (SELECT id FROM auth.users WHERE email = 'admin@test.com')
),
(
    'Customer Support Best Practices',
    '# Customer Support Guidelines

This document outlines best practices for providing excellent customer support through our platform.

## Response Time Goals

- First response: Within 1 hour
- Resolution time: Within 24 hours
- Follow-up: Within 4 hours of customer reply

## Communication Guidelines

1. Be professional and empathetic
2. Use clear, simple language
3. Provide step-by-step solutions
4. Include relevant documentation links

## Escalation Process

When to escalate:
- Technical issues beyond Level 1 scope
- Customer requests refund
- Service outages
- Security concerns

## Quality Standards

Every response should:
- Address all customer concerns
- Be grammatically correct
- Include next steps if needed
- Request feedback when resolved',
    'help_article',
    jsonb_build_object(
        'category', 'Support',
        'tags', ARRAY['customer-service', 'guidelines', 'support'],
        'version', '1.0'
    ),
    (SELECT id FROM auth.users WHERE email = 'admin@test.com')
),
(
    'Frequently Asked Questions',
    '# AutoCRM FAQ

## General Questions

Q: What is AutoCRM?
A: AutoCRM is an AI-powered customer relationship management system that helps businesses automate and improve their customer support operations.

Q: How do I get started?
A: Sign up for an account, complete the onboarding process, and integrate our API with your existing systems.

## Technical Questions

Q: What programming languages do you support?
A: We provide SDKs for:
- JavaScript/TypeScript
- Python
- Ruby
- Java
- Go

Q: How secure is the platform?
A: We use industry-standard encryption, regular security audits, and comply with SOC 2 and GDPR requirements.

## Billing Questions

Q: What payment methods do you accept?
A: We accept all major credit cards and offer invoice billing for enterprise customers.

Q: Can I change my plan anytime?
A: Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.',
    'faq',
    jsonb_build_object(
        'category', 'General',
        'tags', ARRAY['faq', 'getting-started', 'billing'],
        'version', '1.0'
    ),
    (SELECT id FROM auth.users WHERE email = 'admin@test.com')
);
