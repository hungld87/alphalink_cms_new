import type { Schema, Struct } from '@strapi/strapi';

export interface BlockBenefitItem extends Struct.ComponentSchema {
  collectionName: 'components_block_benefit_items';
  info: {
    displayName: 'BenefitItem';
    icon: 'bulletList';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface BlockFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_block_faq_items';
  info: {
    displayName: 'faqItem';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlockFeatureItem extends Struct.ComponentSchema {
  collectionName: 'components_block_feature_items';
  info: {
    displayName: 'featureItem';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlockFeaturedProjects extends Struct.ComponentSchema {
  collectionName: 'components_block_featured_projects';
  info: {
    displayName: 'FeaturedProjects';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    tags: Schema.Attribute.Component<'block.tags', true>;
  };
}

export interface BlockHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_block_hero_slides';
  info: {
    displayName: 'HeroSlide';
    icon: 'apps';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.Required;
    primaryAction: Schema.Attribute.Component<'block.primary-action', false>;
    secondaryAction: Schema.Attribute.Component<
      'block.secondary-action',
      false
    >;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlockJobRequirements extends Struct.ComponentSchema {
  collectionName: 'components_block_job_requirements';
  info: {
    displayName: 'Job_requirements';
  };
  attributes: {
    name: Schema.Attribute.String;
  };
}

export interface BlockJobs extends Struct.ComponentSchema {
  collectionName: 'components_block_jobs';
  info: {
    displayName: 'Jobs';
  };
  attributes: {
    requirements: Schema.Attribute.Component<'block.job-requirements', true>;
    summary: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlockPartners extends Struct.ComponentSchema {
  collectionName: 'components_block_partners';
  info: {
    displayName: 'partners';
  };
  attributes: {
    logo: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlockPrimaryAction extends Struct.ComponentSchema {
  collectionName: 'components_block_primary_actions';
  info: {
    displayName: 'primaryAction';
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlockProcessItem extends Struct.ComponentSchema {
  collectionName: 'components_block_process_items';
  info: {
    displayName: 'processItem';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlockSecondaryAction extends Struct.ComponentSchema {
  collectionName: 'components_block_secondary_actions';
  info: {
    displayName: 'secondaryAction';
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface BlockTags extends Struct.ComponentSchema {
  collectionName: 'components_block_tags';
  info: {
    displayName: 'Tags';
  };
  attributes: {
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'block.benefit-item': BlockBenefitItem;
      'block.faq-item': BlockFaqItem;
      'block.feature-item': BlockFeatureItem;
      'block.featured-projects': BlockFeaturedProjects;
      'block.hero-slide': BlockHeroSlide;
      'block.job-requirements': BlockJobRequirements;
      'block.jobs': BlockJobs;
      'block.partners': BlockPartners;
      'block.primary-action': BlockPrimaryAction;
      'block.process-item': BlockProcessItem;
      'block.secondary-action': BlockSecondaryAction;
      'block.tags': BlockTags;
    }
  }
}
