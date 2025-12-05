import type { Schema, Struct } from '@strapi/strapi';

export interface FooterFooterAddress extends Struct.ComponentSchema {
  collectionName: 'components_footer_footer_addresses';
  info: {
    displayName: 'Footer-address';
    icon: 'apps';
  };
  attributes: {
    address: Schema.Attribute.Text;
    map: Schema.Attribute.Text;
  };
}

export interface FooterFooterInfo extends Struct.ComponentSchema {
  collectionName: 'components_footer_footer_infos';
  info: {
    displayName: 'Footer-info';
    icon: 'apps';
  };
  attributes: {
    companyName: Schema.Attribute.String & Schema.Attribute.Required;
    description: Schema.Attribute.Text;
    logo: Schema.Attribute.Media<'images'>;
  };
}

export interface FooterFooterItem extends Struct.ComponentSchema {
  collectionName: 'components_footer_footer_items';
  info: {
    displayName: 'Footer-item';
    icon: 'apps';
  };
  attributes: {
    about: Schema.Attribute.Component<'footer.footer-service', true>;
    address: Schema.Attribute.Component<'footer.footer-address', false>;
    companyInfo: Schema.Attribute.Component<'footer.footer-info', false>;
    services: Schema.Attribute.Component<'footer.footer-service', true>;
  };
}

export interface FooterFooterService extends Struct.ComponentSchema {
  collectionName: 'components_footer_footer_services';
  info: {
    displayName: 'Footer-service';
    icon: 'apps';
  };
  attributes: {
    link: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HeaderHeaderItem extends Struct.ComponentSchema {
  collectionName: 'components_header_header_items';
  info: {
    displayName: 'Header-item';
    icon: 'apps';
  };
  attributes: {
    Button: Schema.Attribute.Component<'shared.button-item', false>;
    companyName: Schema.Attribute.String & Schema.Attribute.Required;
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    QuickMenu: Schema.Attribute.Component<'shared.menu-item', true>;
    Search: Schema.Attribute.Component<'shared.search-item', false>;
  };
}

export interface SharedAboutWhy extends Struct.ComponentSchema {
  collectionName: 'components_shared_about_whies';
  info: {
    displayName: 'About-why';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedBannerItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_banner_items';
  info: {
    displayName: 'Banner-item';
    icon: 'apps';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedButtonItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_button_items';
  info: {
    displayName: 'Button-item';
    icon: 'apps';
  };
  attributes: {
    isDisplay: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    link: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedForm extends Struct.ComponentSchema {
  collectionName: 'components_shared_forms';
  info: {
    displayName: 'Form';
    icon: 'apps';
  };
  attributes: {
    email: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    note: Schema.Attribute.Text;
    phone: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_menu_items';
  info: {
    displayName: 'Menu-item';
    icon: 'apps';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMission extends Struct.ComponentSchema {
  collectionName: 'components_shared_missions';
  info: {
    displayName: 'About-item';
    icon: 'apps';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface SharedQuestionItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_question_items';
  info: {
    displayName: 'Question-item';
    icon: 'apps';
  };
  attributes: {
    Answser: Schema.Attribute.RichText & Schema.Attribute.Required;
    Question: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface SharedSearchItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_search_items';
  info: {
    displayName: 'Search-item';
    icon: 'apps';
  };
  attributes: {
    isDisplay: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    placeHolder: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO';
    icon: 'apps';
  };
  attributes: {
    content: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSocialItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_items';
  info: {
    displayName: 'Social-item';
    icon: 'apps';
  };
  attributes: {
    link: Schema.Attribute.String & Schema.Attribute.Required;
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface ThemeThemeItem extends Struct.ComponentSchema {
  collectionName: 'components_theme_theme_items';
  info: {
    displayName: 'Theme-item';
    icon: 'apps';
  };
  attributes: {
    key: Schema.Attribute.String;
    value: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'footer.footer-address': FooterFooterAddress;
      'footer.footer-info': FooterFooterInfo;
      'footer.footer-item': FooterFooterItem;
      'footer.footer-service': FooterFooterService;
      'header.header-item': HeaderHeaderItem;
      'shared.about-why': SharedAboutWhy;
      'shared.banner-item': SharedBannerItem;
      'shared.button-item': SharedButtonItem;
      'shared.form': SharedForm;
      'shared.menu-item': SharedMenuItem;
      'shared.mission': SharedMission;
      'shared.question-item': SharedQuestionItem;
      'shared.search-item': SharedSearchItem;
      'shared.seo': SharedSeo;
      'shared.social-item': SharedSocialItem;
      'theme.theme-item': ThemeThemeItem;
    }
  }
}
