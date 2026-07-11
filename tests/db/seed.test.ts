import { describe, it, expect } from 'vitest';
import { SEED_DATA } from '../../src/db/seed-data';

describe('Seed Data', () => {
  it('should have exactly one exam', () => {
    expect(SEED_DATA.exam).toBeDefined();
    expect(SEED_DATA.exam.name).toBe('AWS Certified Cloud Practitioner');
    expect(SEED_DATA.exam.code).toBe('CLF-C02');
  });

  it('should have exactly 4 domains', () => {
    expect(SEED_DATA.domains).toHaveLength(4);
  });

  it('should have correct domain names and weights', () => {
    const domainNames = SEED_DATA.domains.map((d) => d.domain.name);
    expect(domainNames).toContain('Cloud Concepts');
    expect(domainNames).toContain('Security and Compliance');
    expect(domainNames).toContain('Cloud Technology and Services');
    expect(domainNames).toContain('Billing, Pricing, and Support');

    const totalWeight = SEED_DATA.domains.reduce(
      (sum, d) => sum + d.domain.weight,
      0,
    );
    expect(totalWeight).toBe(100);
  });

  it('should have correct domain weights', () => {
    const cloudConcepts = SEED_DATA.domains.find(
      (d) => d.domain.name === 'Cloud Concepts',
    );
    expect(cloudConcepts?.domain.weight).toBe(24);

    const security = SEED_DATA.domains.find(
      (d) => d.domain.name === 'Security and Compliance',
    );
    expect(security?.domain.weight).toBe(30);

    const techServices = SEED_DATA.domains.find(
      (d) => d.domain.name === 'Cloud Technology and Services',
    );
    expect(techServices?.domain.weight).toBe(34);

    const billing = SEED_DATA.domains.find(
      (d) => d.domain.name === 'Billing, Pricing, and Support',
    );
    expect(billing?.domain.weight).toBe(12);
  });

  it('should have at least one topic per domain', () => {
    for (const domain of SEED_DATA.domains) {
      expect(domain.topics.length).toBeGreaterThan(0);
    }
  });

  it('should have all topics starting with not_started status', () => {
    for (const domain of SEED_DATA.domains) {
      for (const topic of domain.topics) {
        expect(topic.topic.status).toBe('not_started');
        if (topic.subTopics) {
          for (const sub of topic.subTopics) {
            expect(sub.status).toBe('not_started');
          }
        }
      }
    }
  });

  it('should have Cloud Concepts with 5 topics', () => {
    const cloudConcepts = SEED_DATA.domains.find(
      (d) => d.domain.name === 'Cloud Concepts',
    );
    expect(cloudConcepts?.topics).toHaveLength(5);
  });

  it('should have correct topic order numbering', () => {
    for (const domain of SEED_DATA.domains) {
      domain.topics.forEach((topic, index) => {
        expect(topic.topic.order).toBe(index + 1);
      });
    }
  });
});
