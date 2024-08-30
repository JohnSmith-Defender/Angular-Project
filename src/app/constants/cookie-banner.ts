import { NgcCookieConsentConfig } from "ngx-cookieconsent";

export const cookieConfig: NgcCookieConsentConfig = {
  autoOpen:false,
  cookie: {
    domain: 'localhost'
  },
  position: 'bottom-right',
  theme: 'classic',
  palette: {
    popup: {
      background: '#000'
    },
    button: {
      background: '#f1d600'
    }
  },
  type: 'opt-out',
  content: {
    message: 'This website uses cookies to enhance your browsing experience, analyse site traffic, and personalise content. By clicking "Allow Cookies" you consent to the use of cookies. You can manage your preferences or learn more in our',
    allow:'Accept cookies',
    deny: 'Reject',
    link: 'Cookie Policy',
    href: 'https://www.cursogenius.es/privacy-cookies-policy/',
  },
};

