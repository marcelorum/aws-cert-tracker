import type { Exam, Domain, Topic } from '../lib/types';
import { db } from './schema';

interface SeedExam {
  exam: Exam;
  domains: SeedDomain[];
}

interface SeedDomain {
  domain: Omit<Domain, 'examId'>;
  topics: SeedTopic[];
}

interface SeedTopic {
  topic: Omit<Topic, 'domainId'>;
  subTopics?: Omit<Topic, 'domainId'>[];
}

const SEED_DATA: SeedExam = {
  exam: {
    name: 'AWS Certified Cloud Practitioner',
    code: 'CLF-C02',
  },
  domains: [
    {
      domain: { name: 'Cloud Concepts', weight: 24, order: 1 },
      topics: [
        {
          topic: { name: 'Cloud Computing Models', description: 'IaaS, PaaS, SaaS — service models and their characteristics', order: 1, status: 'not_started' },
          subTopics: [
            { name: 'Infrastructure as a Service (IaaS)', description: 'Virtualized computing resources over the internet', order: 1, status: 'not_started' },
            { name: 'Platform as a Service (PaaS)', description: 'Managed platform for application deployment', order: 2, status: 'not_started' },
            { name: 'Software as a Service (SaaS)', description: 'Ready-to-use software delivered over the web', order: 3, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'AWS Well-Architected Framework', description: 'Six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability', order: 2, status: 'not_started' },
          subTopics: [
            { name: 'Operational Excellence Pillar', description: 'Run and monitor systems to deliver business value', order: 1, status: 'not_started' },
            { name: 'Security Pillar', description: 'Protect data, systems, and assets', order: 2, status: 'not_started' },
            { name: 'Reliability Pillar', description: 'Recover from disruptions and meet demand', order: 3, status: 'not_started' },
            { name: 'Performance Efficiency Pillar', description: 'Use computing resources efficiently', order: 4, status: 'not_started' },
            { name: 'Cost Optimization Pillar', description: 'Avoid unnecessary costs', order: 5, status: 'not_started' },
            { name: 'Sustainability Pillar', description: 'Minimize environmental impact', order: 6, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'AWS Global Infrastructure', description: 'Regions, Availability Zones, Edge Locations, Local Zones', order: 3, status: 'not_started' },
          subTopics: [
            { name: 'AWS Regions', description: 'Geographic areas with multiple AZs', order: 1, status: 'not_started' },
            { name: 'Availability Zones', description: 'Isolated data centers within a Region', order: 2, status: 'not_started' },
            { name: 'Edge Locations', description: 'Content delivery points for CloudFront', order: 3, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'Cloud Economics', description: 'TCO, Capex vs Opex, economies of scale', order: 4, status: 'not_started' },
          subTopics: [
            { name: 'Capital Expenditure (CapEx)', description: 'Upfront infrastructure costs', order: 1, status: 'not_started' },
            { name: 'Operational Expenditure (OpEx)', description: 'Pay-as-you-go operating costs', order: 2, status: 'not_started' },
            { name: 'Total Cost of Ownership (TCO)', description: 'Comparing on-premises vs cloud costs', order: 3, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'Migration Strategies (6 Rs)', description: 'Rehost, Replatform, Refactor, Relocate, Retain, Retire', order: 5, status: 'not_started' },
          subTopics: [
            { name: 'Rehost (Lift and Shift)', description: 'Move applications without changes', order: 1, status: 'not_started' },
            { name: 'Replatform (Lift and Reshape)', description: 'Move with some optimizations', order: 2, status: 'not_started' },
            { name: 'Refactor/Re-architect', description: 'Rebuild using cloud-native features', order: 3, status: 'not_started' },
            { name: 'Relocate', description: 'Move to a different AWS Region', order: 4, status: 'not_started' },
            { name: 'Retain', description: 'Keep applications on-premises', order: 5, status: 'not_started' },
            { name: 'Retire', description: 'Decommission unnecessary applications', order: 6, status: 'not_started' },
          ],
        },
      ],
    },
    {
      domain: { name: 'Security and Compliance', weight: 30, order: 2 },
      topics: [
        {
          topic: { name: 'Shared Responsibility Model', description: 'AWS security OF the cloud vs security IN the cloud', order: 1, status: 'not_started' },
        },
        {
          topic: { name: 'AWS IAM', description: 'Identity and Access Management — users, groups, roles, policies', order: 2, status: 'not_started' },
          subTopics: [
            { name: 'IAM Users', description: 'Individual user accounts with credentials', order: 1, status: 'not_started' },
            { name: 'IAM Groups', description: 'Collections of users with shared permissions', order: 2, status: 'not_started' },
            { name: 'IAM Roles', description: 'Temporary permissions for trusted entities', order: 3, status: 'not_started' },
            { name: 'IAM Policies', description: 'JSON documents defining permissions', order: 4, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'AWS Security Services', description: 'GuardDuty, Inspector, Shield, WAF, KMS, CloudTrail', order: 3, status: 'not_started' },
          subTopics: [
            { name: 'AWS GuardDuty', description: 'Threat detection service', order: 1, status: 'not_started' },
            { name: 'AWS Inspector', description: 'Vulnerability management', order: 2, status: 'not_started' },
            { name: 'AWS Shield', description: 'DDoS protection', order: 3, status: 'not_started' },
            { name: 'AWS WAF', description: 'Web application firewall', order: 4, status: 'not_started' },
            { name: 'AWS KMS', description: 'Key Management Service for encryption', order: 5, status: 'not_started' },
            { name: 'AWS CloudTrail', description: 'API activity logging', order: 6, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'Compliance Programs', description: 'AWS compliance certifications, artifacts, and reports', order: 4, status: 'not_started' },
          subTopics: [
            { name: 'Compliance Certifications', description: 'SOC, PCI DSS, HIPAA, FedRAMP', order: 1, status: 'not_started' },
            { name: 'AWS Artifact', description: 'Portal for compliance reports', order: 2, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'Data Encryption', description: 'Encryption at rest and in transit', order: 5, status: 'not_started' },
          subTopics: [
            { name: 'Encryption at Rest', description: 'Protecting stored data (SSE-S3, SSE-KMS, EBS encryption)', order: 1, status: 'not_started' },
            { name: 'Encryption in Transit', description: 'Protecting data in motion (TLS/SSL, HTTPS, VPN)', order: 2, status: 'not_started' },
          ],
        },
      ],
    },
    {
      domain: { name: 'Cloud Technology and Services', weight: 34, order: 3 },
      topics: [
        {
          topic: { name: 'Compute Services', description: 'EC2, Lambda, Elastic Beanstalk, Lightsail', order: 1, status: 'not_started' },
          subTopics: [
            { name: 'Amazon EC2', description: 'Virtual servers in the cloud', order: 1, status: 'not_started' },
            { name: 'AWS Lambda', description: 'Serverless compute functions', order: 2, status: 'not_started' },
            { name: 'AWS Elastic Beanstalk', description: 'PaaS for application deployment', order: 3, status: 'not_started' },
            { name: 'Amazon Lightsail', description: 'Simplified VPS instances', order: 4, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'Storage Services', description: 'S3, EBS, EFS, S3 Glacier', order: 2, status: 'not_started' },
          subTopics: [
            { name: 'Amazon S3', description: 'Object storage for any data', order: 1, status: 'not_started' },
            { name: 'Amazon EBS', description: 'Block storage for EC2 instances', order: 2, status: 'not_started' },
            { name: 'Amazon EFS', description: 'Managed file storage for EC2', order: 3, status: 'not_started' },
            { name: 'S3 Glacier', description: 'Low-cost archival storage', order: 4, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'Database Services', description: 'RDS, DynamoDB, Aurora, Redshift', order: 3, status: 'not_started' },
          subTopics: [
            { name: 'Amazon RDS', description: 'Managed relational databases', order: 1, status: 'not_started' },
            { name: 'Amazon DynamoDB', description: 'NoSQL key-value and document database', order: 2, status: 'not_started' },
            { name: 'Amazon Aurora', description: 'High-performance MySQL/PostgreSQL-compatible DB', order: 3, status: 'not_started' },
            { name: 'Amazon Redshift', description: 'Petabyte-scale data warehousing', order: 4, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'Networking Services', description: 'VPC, Route 53, CloudFront, VPN', order: 4, status: 'not_started' },
          subTopics: [
            { name: 'Amazon VPC', description: 'Isolated network in the cloud', order: 1, status: 'not_started' },
            { name: 'Amazon Route 53', description: 'DNS and domain management', order: 2, status: 'not_started' },
            { name: 'Amazon CloudFront', description: 'CDN for fast content delivery', order: 3, status: 'not_started' },
            { name: 'AWS VPN', description: 'Secure connection to AWS networks', order: 4, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'Serverless and ML', description: 'Serverless services, AWS ML/AI services, management tools', order: 5, status: 'not_started' },
          subTopics: [
            { name: 'AWS Step Functions', description: 'Serverless workflow orchestration', order: 1, status: 'not_started' },
            { name: 'Amazon SQS', description: 'Message queuing service', order: 2, status: 'not_started' },
            { name: 'Amazon SNS', description: 'Push notification service', order: 3, status: 'not_started' },
            { name: 'AWS Management Tools', description: 'CloudWatch, CloudFormation, Config, Systems Manager', order: 4, status: 'not_started' },
          ],
        },
      ],
    },
    {
      domain: { name: 'Billing, Pricing, and Support', weight: 12, order: 4 },
      topics: [
        {
          topic: { name: 'Pricing Models', description: 'On-Demand, Reserved, Spot, Savings Plans', order: 1, status: 'not_started' },
          subTopics: [
            { name: 'On-Demand Pricing', description: 'Pay for compute by hour/second', order: 1, status: 'not_started' },
            { name: 'Reserved Instances', description: 'Significant discount for 1/3 year commitment', order: 2, status: 'not_started' },
            { name: 'Spot Instances', description: 'Low-cost spare compute capacity', order: 3, status: 'not_started' },
            { name: 'Savings Plans', description: 'Flexible pricing based on compute commitment', order: 4, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'Cost Management Tools', description: 'AWS Cost Explorer, Budgets, Cost & Usage Report', order: 2, status: 'not_started' },
          subTopics: [
            { name: 'AWS Cost Explorer', description: 'Visualize and analyze costs', order: 1, status: 'not_started' },
            { name: 'AWS Budgets', description: 'Set cost and usage thresholds', order: 2, status: 'not_started' },
            { name: 'Cost & Usage Report', description: 'Granular cost data export', order: 3, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'AWS Support Plans', description: 'Basic, Developer, Business, Enterprise', order: 3, status: 'not_started' },
          subTopics: [
            { name: 'Basic Support', description: 'Account and billing support only', order: 1, status: 'not_started' },
            { name: 'Developer Support', description: 'Business hours access to Cloud Support', order: 2, status: 'not_started' },
            { name: 'Business Support', description: '24/7 access, faster response times', order: 3, status: 'not_started' },
            { name: 'Enterprise Support', description: 'TAM, concierge, and proactive guidance', order: 4, status: 'not_started' },
          ],
        },
        {
          topic: { name: 'AWS Marketplace', description: 'Third-party software and services catalog', order: 4, status: 'not_started' },
        },
        {
          topic: { name: 'Total Cost of Ownership', description: 'TCO comparison tools and calculations', order: 5, status: 'not_started' },
          subTopics: [
            { name: 'AWS TCO Calculator', description: 'Compare on-premises vs AWS costs', order: 1, status: 'not_started' },
            { name: 'AWS Pricing Calculator', description: 'Estimate service costs', order: 2, status: 'not_started' },
          ],
        },
      ],
    },
  ],
};

export async function seedDatabase(): Promise<void> {
  const examCount = await db.exam.count();
  if (examCount > 0) return; // already seeded

  await db.transaction('rw', [db.exam, db.domain, db.topic], async () => {
    const examId = await db.exam.add(SEED_DATA.exam);

    for (const seedDomain of SEED_DATA.domains) {
      const domainId = await db.domain.add({
        ...seedDomain.domain,
        examId,
      });

      for (const seedTopic of seedDomain.topics) {
        const topicId = await db.topic.add({
          ...seedTopic.topic,
          domainId,
        });

        if (seedTopic.subTopics) {
          for (const subTopic of seedTopic.subTopics) {
            await db.topic.add({
              ...subTopic,
              domainId,
              parentTopicId: topicId,
            });
          }
        }
      }
    }
  });
}

export { SEED_DATA };
