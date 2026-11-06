import { brand } from "./property";

/**
 * Legal and guest-information documents, rendered at /legal/<slug>, listed on the
 * /legal hub and linked from the footer.
 *
 * Written to match what this site actually does today (bookings confirmed by message,
 * address withheld until confirmation, verified-guest reviews, no tracking cookies, a
 * remembered light/dark preference) and to Kenyan context (Data Protection Act, 2019).
 *
 * IMPORTANT: this is a thorough starting draft, not legal advice. Have a Kenyan advocate
 * review it, and have the host confirm the CONFIRM items (cancellation terms, deposits,
 * additional house rules, camera policy, registered name) before launch. Update `updated`
 * whenever the wording changes.
 */

export interface LegalSection {
  heading: string;
  paras?: string[];
  items?: string[];
  /** Renders ready-to-use WhatsApp, email and call buttons under the text. */
  contact?: boolean;
}

export interface LegalDoc {
  slug: string;
  title: string;
  /** Short label for links. */
  label: string;
  group: "legal" | "guest";
  /** Listed in the footer (the hub lists everything). */
  footer: boolean;
  updated: string; // ISO date
  summary: string;
  /** "At a glance" bullets shown at the top of the page. */
  highlights: string[];
  sections: LegalSection[];
}

const contactIntro = "Questions about this document, or a request about your data? Get in touch and we'll respond promptly.";

export const legalDocs: LegalDoc[] = [
  /* ------------------------------------------------------------------ TERMS */
  {
    slug: "terms",
    title: "Terms of Service",
    label: "Terms of Service",
    group: "legal",
    footer: true,
    updated: "2026-11-06",
    summary: `The terms that apply when you use the ${brand.name} website and book a stay through it.`,
    highlights: [
      "A booking is confirmed only when the host confirms it in writing and any payment asked for has been received.",
      "You do not need an account to book.",
      "The exact address is shared only after your booking is confirmed.",
      "Kenyan law applies, and your statutory consumer rights are not affected.",
    ],
    sections: [
      {
        heading: "About these terms",
        paras: [
          `These terms apply to your use of the ${brand.name} website and to any stay you book through it. ${brand.legalName} ("we", "us") lists and manages short-stay properties in Kenya. In these terms a "host" means ${brand.name} or the person managing a property on its behalf, a "guest" means you and everyone staying with you, and a "stay" means a booking for a property or part of one.`,
          "By using the website or sending us a booking request you agree to these terms. If you do not agree, please do not book.",
        ],
      },
      {
        heading: "Who can book",
        items: [
          "You must be at least 18 and able to enter into a binding agreement.",
          "If you book for a group, you are the lead guest: you are responsible for making sure everyone in your party knows and follows these terms and the House Rules.",
          "You must give us accurate information about yourself and the number of people staying.",
        ],
      },
      {
        heading: "How booking works",
        paras: [
          "Choosing dates, guests and an option on the website creates a booking request, not a confirmed reservation. No account is needed.",
        ],
        items: [
          "You send us your request, usually by WhatsApp with your details prefilled.",
          "We check availability and reply to confirm, suggest alternatives or decline.",
          "If we can host you, we send a booking confirmation stating the price, the payment instructions and the terms that apply.",
          "Your booking is confirmed once you have received our written confirmation and have paid anything the confirmation asks for, by the date it asks.",
        ],
      },
      {
        heading: "Prices, taxes and payment",
        paras: [
          "All prices are shown in Kenyan shillings (KES) per night for the option you select. The total on the website is a guide based on the nights you chose. The amount you are asked to pay, when it is due and the accepted payment methods are stated in your booking confirmation.",
          "Any deposit, tax or additional fee that applies will be stated to you before you pay. If a price on the website is wrong, we will tell you before confirming and you may withdraw your request without charge.",
          "Online payment is not yet taken through this website. Please never pay anyone who contacts you claiming to represent us unless the payment details match those in your written confirmation.",
        ],
      },
      {
        heading: "Check-in, check-out and length of stay",
        paras: [
          "Each property has its own check-in and check-out times and a minimum number of nights, shown on its page and repeated in your confirmation. Please keep to them so the property is ready for the next guests. Early check-in or late check-out is possible only if the host agrees in advance.",
        ],
      },
      {
        heading: "Occupancy and visitors",
        items: [
          "The number of guests must not exceed the maximum for the option you booked.",
          "People who are not staying, including day visitors, need the host's agreement beforehand.",
          "Parties, events and commercial filming or photography need the host's written permission in advance. Without it they are not allowed.",
          "You may not sublet the property or let anyone else stay in your place.",
        ],
      },
      {
        heading: "Address and access",
        paras: [
          "To protect the privacy and security of our properties and their neighbours, the exact address and arrival instructions are shared only once your booking is confirmed. Please do not share them publicly.",
        ],
      },
      {
        heading: "Looking after the property",
        paras: [
          "You must take reasonable care of the property, its furnishings and its artwork, follow our House Rules and Safety Information, respect the neighbours and obey Kenyan law. Some of our homes contain original artwork and handmade furniture that cannot easily be replaced.",
          "Please tell the host promptly about any damage, breakage or problem so it can be put right.",
        ],
      },
      {
        heading: "Damage, loss and deposits",
        paras: [
          "You are responsible for loss or damage to the property or its contents caused by you or anyone in your party, other than fair wear and tear. If a security deposit applies, the amount and how it is returned are stated in your booking confirmation. We will tell you what we propose to deduct and why before doing so.",
        ],
      },
      {
        heading: "Our responsibilities",
        paras: [
          "We take reasonable care to describe each property accurately, keep it clean and safe, and be reachable during your stay. Photographs are representative of the property and small differences such as furnishings or planting may occur.",
          "If something is not as described or stops working, please tell us straight away so we can fix it or offer a reasonable alternative.",
        ],
      },
      {
        heading: "Ending a stay early",
        paras: [
          "We may ask a guest to leave, without a refund for the unused nights, if there is a serious or repeated breach of these terms, a risk to people or property, or unlawful activity. We will explain the reason and, where it is safe to do so, give a chance to put things right first.",
        ],
      },
      {
        heading: "Cancellations, changes and refunds",
        paras: [
          "Cancellations, date changes and refunds are covered by our Cancellation & Refund Policy, which forms part of these terms.",
        ],
      },
      {
        heading: "Guest reviews",
        paras: [
          "Reviews are accepted only from guests who have completed a stay. How they are collected and moderated is set out in our Reviews Policy.",
        ],
      },
      {
        heading: "Using this website",
        items: [
          "Use the website only for its intended purpose: finding and requesting stays.",
          "Do not copy, scrape or reuse the text, photographs or design without our written permission, other than sharing a link to a page.",
          "Do not try to disrupt the website, bypass its security or submit false or misleading booking requests.",
        ],
        paras: [
          `The content of this website belongs to ${brand.legalName} or its licensors. We work to keep the site accurate and available, but provide it as it is, and it may sometimes be unavailable or contain errors.`,
        ],
      },
      {
        heading: "Liability",
        paras: [
          "To the extent the law permits, we are not responsible for loss or damage that was not reasonably foreseeable, for loss of personal belongings, or for events outside our reasonable control. Nothing in these terms limits any liability that cannot lawfully be limited, including liability for death or personal injury caused by negligence, or for fraud. Your statutory consumer rights under Kenyan law are not affected.",
        ],
      },
      {
        heading: "Events outside our control",
        paras: [
          "Neither of us is liable for a failure or delay caused by events beyond reasonable control, such as severe weather, civil unrest, government action or a prolonged utility failure. In that case we will work with you in good faith to rebook or refund, as set out in the Cancellation & Refund Policy.",
        ],
      },
      {
        heading: "Complaints",
        paras: [
          "If something goes wrong, please tell us as soon as you can, ideally during your stay, so we can put it right quickly. If you are still unhappy afterwards, write to us with the details and we will respond promptly and try to resolve it fairly.",
        ],
      },
      {
        heading: "Changes to these terms",
        paras: [
          "We may update these terms from time to time and show the date of the latest update at the top. The version published on the date of your booking request is the one that applies to that booking.",
        ],
      },
      {
        heading: "General",
        items: [
          "If any part of these terms is found to be unenforceable, the rest still applies.",
          "These terms, together with your booking confirmation, are the whole agreement between us about your stay.",
          "If we do not enforce a term straight away, that does not mean we have given it up.",
          "Notices to you may be sent to the contact details you gave us, and notices to us to the contact details below.",
        ],
      },
      {
        heading: "Governing law and disputes",
        paras: [
          "These terms are governed by the laws of Kenya. We will always try to settle any disagreement by talking first. If that does not work, the courts of Kenya have jurisdiction, without affecting any rights you have as a consumer.",
        ],
      },
      { heading: "Contact", paras: [contactIntro], contact: true },
    ],
  },

  /* ---------------------------------------------------------------- PRIVACY */
  {
    slug: "privacy",
    title: "Privacy Policy",
    label: "Privacy Policy",
    group: "legal",
    footer: true,
    updated: "2026-11-06",
    summary:
      "What personal data we collect, why we use it, who sees it, how long we keep it and the rights you have under Kenya's Data Protection Act, 2019.",
    highlights: [
      "We never sell your personal data.",
      "This website does not collect your name or payment details: booking requests reach us by message.",
      "You can ask to see, correct or delete your data at any time.",
      "You can complain to the Office of the Data Protection Commissioner of Kenya.",
    ],
    sections: [
      {
        heading: "Who is responsible for your data",
        paras: [
          `${brand.legalName} is the data controller for personal data collected through this website and when you contact us about a stay. We process personal data in line with the Data Protection Act, 2019 of Kenya and its regulations.`,
        ],
      },
      {
        heading: "What we collect",
        paras: ["The information we hold depends on how you deal with us."],
        items: [
          "Enquiries and bookings: your name, WhatsApp number or email, the dates and number of guests, and anything else you choose to tell us.",
          "Running your stay: arrival details, identification where the law requires us to record it, and confirmation of payment.",
          "Reviews: if you are invited to review a completed stay, the review you write and the stay details it relates to.",
          "Technical information: basic data your browser sends when you visit, such as IP address and device type, which our hosting provider may keep in standard server logs.",
          "Preferences: your light or dark theme choice, saved in your own browser (see our Cookie Notice).",
        ],
      },
      {
        heading: "What this website does not collect",
        paras: [
          "This website does not itself take your name, contact details or payment details. When you choose Reserve, a message is prepared for you to send us on WhatsApp and nothing is sent until you send it. The Share button creates a link containing the dates and option you chose but no personal information. We do not run advertising or tracking analytics.",
        ],
      },
      {
        heading: "How and why we use it",
        items: [
          "To reply to your enquiry and to confirm, manage and host your booking.",
          "To meet legal, tax, accounting and guest-record obligations.",
          "To keep our properties, guests and neighbours safe, and to protect the website from misuse.",
          "To invite you to leave a review after a completed stay.",
          "To send you news or offers only if you have asked us to, and you can stop at any time.",
        ],
      },
      {
        heading: "Our lawful grounds",
        paras: [
          "We rely on the performance of a contract (your booking), compliance with legal obligations, our legitimate interests in running a safe and reliable service, and your consent where we ask for it, for example for marketing messages. Where we rely on consent you can withdraw it whenever you like.",
        ],
      },
      {
        heading: "Who we share it with",
        paras: ["We share personal data only where it is needed to provide the service, and never to sell it:"],
        items: [
          "Messaging providers such as WhatsApp, when you contact us or we reply to you.",
          "Hosting and technology providers that keep this website running.",
          "Payment providers, if and when online payment is offered.",
          "People who help us run a stay, such as housekeeping or caretaking staff, who see only what they need.",
          "Professional advisers and authorities, where we are legally required to or need to protect our legal rights.",
        ],
      },
      {
        heading: "Cameras and security",
        paras: [
          "If a property uses security cameras, we will say so on its listing. We do not place cameras inside bedrooms or bathrooms.",
        ],
      },
      {
        heading: "Transfers outside Kenya",
        paras: [
          "Some of our providers process data outside Kenya. Where that happens we take steps to make sure your data stays protected in line with the Data Protection Act, 2019.",
        ],
      },
      {
        heading: "How long we keep it",
        items: [
          "Enquiries that do not become bookings: kept only for as long as needed to answer you, then deleted.",
          "Bookings and guest records: kept for as long as needed to run the stay and to meet legal, tax and accounting requirements.",
          "Reviews: kept for as long as the review is published, unless you ask us to remove it.",
          "After that, we delete or anonymise the data.",
        ],
      },
      {
        heading: "Your rights",
        paras: ["Under the Data Protection Act, 2019 you have the right to:"],
        items: [
          "be told how your data is used, and to access it;",
          "ask us to correct inaccurate or incomplete data;",
          "ask us to delete your data, or restrict how we use it, where the law allows;",
          "object to certain uses of your data and to withdraw consent you have given;",
          "receive your data in a portable format where applicable.",
        ],
      },
      {
        heading: "How to use your rights",
        paras: [
          "Contact us using the details below and tell us what you would like. We may need to confirm who you are first, and we will respond within the time the law allows. There is no charge for ordinary requests.",
        ],
      },
      {
        heading: "Security and breaches",
        paras: [
          "We use reasonable technical and organisational measures to protect personal data and limit access to those who need it. No online service can be completely secure, so please share only the information a booking requires. If a breach affecting your data occurs we will tell you and the Data Protection Commissioner where the law requires.",
        ],
      },
      {
        heading: "Children",
        paras: [
          "This website is intended for adults. We do not knowingly collect personal data from anyone under 18, other than the names and ages of children included in a booking.",
        ],
      },
      {
        heading: "Complaints",
        paras: [
          "If you are unhappy with how we handle your data, please tell us first so we can put it right. You also have the right to complain to the Office of the Data Protection Commissioner of Kenya (odpc.go.ke).",
        ],
      },
      {
        heading: "Changes to this policy",
        paras: ["We will update this page when our practices change and show the date of the latest update at the top."],
      },
      { heading: "Contact", paras: [contactIntro], contact: true },
    ],
  },

  /* ---------------------------------------------------------------- COOKIES */
  {
    slug: "cookies",
    title: "Cookie Notice",
    label: "Cookie Notice",
    group: "legal",
    footer: true,
    updated: "2026-11-06",
    summary: "How this website uses cookies and similar technologies.",
    highlights: [
      "No advertising, analytics or tracking cookies are used.",
      "The site remembers only your light or dark theme choice, in your own browser.",
      "You can clear it at any time in your browser settings.",
    ],
    sections: [
      {
        heading: "What are cookies",
        paras: [
          "Cookies are small files that a website stores in your browser. Similar technologies, such as your browser's local storage, do the same job. They can keep you signed in, remember preferences or measure how a site is used.",
        ],
      },
      {
        heading: "What we use today",
        items: [
          "Advertising, analytics and tracking cookies: none. The site works without them.",
          "Strictly necessary: none are required to browse the site or request a stay.",
          "Preference: your choice of light or dark theme is saved in your browser's local storage so the site looks the same next time you visit. It stays on your device and is never sent to us.",
        ],
      },
      {
        heading: "Third-party services",
        paras: [
          "When you choose to message us on WhatsApp, or open our Instagram or TikTok pages, you leave this website and the other service's own terms, privacy practices and cookies apply. We do not control them.",
        ],
      },
      {
        heading: "Managing cookies and stored data",
        paras: [
          "You can block or delete cookies and site data in your browser settings at any time. Clearing the data simply resets the site to your device's default light or dark setting, and will not stop you using the site.",
        ],
      },
      {
        heading: "If this changes",
        paras: [
          "If we add analytics or other non-essential cookies in future, we will ask for your consent first and update this notice.",
        ],
      },
      { heading: "Contact", paras: [contactIntro], contact: true },
    ],
  },

  /* ---------------------------------------------------------- REVIEWS POLICY */
  {
    slug: "reviews-policy",
    title: "Reviews Policy",
    label: "Reviews Policy",
    group: "guest",
    footer: false,
    updated: "2026-11-06",
    summary: "How guest reviews work, and why every review on this site comes from someone who actually stayed.",
    highlights: [
      "Only guests who have completed a stay can review it.",
      "Each review is tied to a real booking and shows the stay it relates to.",
      "We never pay for reviews or edit what guests write.",
    ],
    sections: [
      {
        heading: "Why we do it this way",
        paras: [
          "A review is only useful if it comes from someone who has experienced the place. So we accept reviews only from guests who have stayed, and we do not publish reviews of stays that have not happened.",
        ],
      },
      {
        heading: "Who can leave a review",
        items: [
          "Guests with a completed booking, after they have checked out.",
          "Each guest is sent a personal link by the host after checkout. The link is tied to their booking and can be used once.",
          "There is no open review form on the website, which keeps out reviews from people who have not stayed.",
        ],
      },
      {
        heading: "What a published review shows",
        paras: [
          "A review appears with the guest's name as they chose to give it, the month of the stay, the number of nights and which option they booked, such as part of the home or the whole property.",
        ],
      },
      {
        heading: "What we will not publish",
        items: [
          "Abusive, discriminatory or unlawful content.",
          "Other people's personal information, such as phone numbers or home addresses.",
          "Content that is not about the stay itself.",
          "Anything that reveals the exact address of a property.",
        ],
        paras: ["We do not edit the wording of a review. We either publish it as written or decline it, and tell the guest why."],
      },
      {
        heading: "Fairness",
        items: [
          "We do not pay for reviews, and we do not make rewards, refunds or discounts depend on the rating given.",
          "Hosts and their staff cannot write reviews of their own properties.",
          "We do not remove a review just because it is critical.",
        ],
      },
      {
        heading: "Removing or correcting a review",
        paras: [
          "If you wrote a review and want it changed or removed, or you believe a review breaks this policy, contact us with the details and we will look into it promptly.",
        ],
      },
      { heading: "Contact", paras: [contactIntro], contact: true },
    ],
  },

  /* ----------------------------------------------------------- CANCELLATION */
  {
    slug: "cancellation",
    title: "Cancellation & Refund Policy",
    label: "Cancellation & Refunds",
    group: "guest",
    footer: true,
    updated: "2026-11-06",
    summary: "How cancellations, changes and refunds work for a stay booked through Roam & Rest.",
    highlights: [
      "The cancellation terms for your stay are in your booking confirmation, and you can read them before you pay.",
      "If we have to cancel, you can choose new dates or a full refund.",
      "Message us as early as you can if your plans change.",
    ],
    sections: [
      {
        heading: "Terms are confirmed before you pay",
        paras: [
          "Cancellation terms can differ between stays and seasons. The terms that apply to your booking are stated in your booking confirmation, and you can review them before you pay.",
        ],
      },
      {
        heading: "If you need to cancel",
        paras: [
          "Please message us as soon as you can. Whether you receive a refund, and how much, depends on the terms in your confirmation and how much notice you give. We will always confirm the outcome in writing.",
        ],
      },
      {
        heading: "If you need to change your dates or option",
        items: [
          "Changes are subject to availability.",
          "If the nightly rate is different for the new dates or option, the price may change and we will tell you before confirming.",
          "A change that is agreed in writing replaces the original booking.",
        ],
      },
      {
        heading: "If we need to cancel",
        paras: [
          "If the host has to cancel a confirmed booking, we will tell you straight away and offer you the choice of alternative dates or a full refund of the amounts you have paid for that booking.",
        ],
      },
      {
        heading: "Late arrival, early departure and no-shows",
        paras: [
          "Unless your booking confirmation says otherwise, nights you do not use after arriving late, leaving early or not arriving are not refunded. If you expect to arrive late, please let us know so we can keep the property ready for you.",
        ],
      },
      {
        heading: "Events beyond our control",
        paras: [
          "If a stay cannot go ahead because of events beyond reasonable control, such as severe weather, civil unrest or a prolonged utility failure, we will work with you in good faith to rebook, or to refund a fair proportion of what you have paid.",
        ],
      },
      {
        heading: "Travel insurance",
        paras: [
          "We recommend travel insurance that covers cancellation, as some reasons for cancelling, such as illness or transport disruption, may not be covered by our terms.",
        ],
      },
      {
        heading: "How refunds are paid",
        paras: [
          "Refunds are paid to the original payment method, or as otherwise agreed with you, within a reasonable time after the cancellation is confirmed. We will tell you when to expect it.",
        ],
      },
      {
        heading: "Disagreements",
        paras: [
          "If you think a refund has been calculated wrongly, write to us with your booking details and we will review it promptly. This policy is part of our Terms of Service.",
        ],
      },
      { heading: "Questions", paras: [contactIntro], contact: true },
    ],
  },

  /* ------------------------------------------------------------ HOUSE RULES */
  {
    slug: "house-rules",
    title: "House Rules & Check-in",
    label: "House Rules",
    group: "guest",
    footer: true,
    updated: "2026-11-06",
    summary: "What to expect on arrival and how we ask guests to look after our homes.",
    highlights: [
      "Check-in and check-out times are on each stay's page and in your confirmation.",
      "Stay within the guest limit for the option you booked.",
      "Please treat the furniture, fittings and any artwork with care and report any damage.",
      "Where a property has a pool or fireplace, follow the safety notes for it.",
    ],
    sections: [
      {
        heading: "Before you arrive",
        items: [
          "We will send the exact address and arrival instructions once your booking is confirmed.",
          "Please tell us your expected arrival time, especially if it will be late.",
          "Bring anything you would like for the kitchen and your own toiletries.",
        ],
      },
      {
        heading: "Check-in and check-out",
        items: [
          "Check-in and check-out times are shown on each stay's page.",
          "Early check-in or late check-out is possible only if the host agrees in advance.",
          "Before you leave, please close windows, lock doors and gates, switch off lights and appliances, and tell us if anything needs attention.",
        ],
      },
      {
        heading: "Guests and visitors",
        items: [
          "Please keep within the maximum number of guests for the option you booked.",
          "Visitors who are not staying need the host's agreement in advance.",
          "Parties and events are not allowed without the host's written permission.",
        ],
      },
      {
        heading: "Parking",
        paras: ["Free parking is available on the property where the listing says so. Please park only in the areas shown to you."],
      },
      {
        heading: "Pools and outdoor areas (where the property has them)",
        items: [
          "Pools are used at your own risk. Unless stated otherwise there is no lifeguard on duty.",
          "Children and non-swimmers must be supervised by an adult at all times.",
          "Please shower before swimming where facilities allow, and keep glass away from the pool area.",
          "Please do not run, dive into shallow water or swim alone after dark.",
        ],
      },
      {
        heading: "Our homes and furnishings",
        paras: [
          "Some homes have original artwork or handcrafted furniture. Please treat everything with care, do not move or hang anything on the artwork, and let us know straight away if something is damaged so we can put it right.",
        ],
      },
      {
        heading: "Kitchen and household",
        items: [
          "Please leave the kitchen tidy and take your rubbish to the place the host shows you.",
          "Please use water and electricity sensibly, and tell us if there is a power or water problem.",
          "WiFi is provided for guests' use. Please do not use it for anything unlawful.",
        ],
      },
      {
        heading: "Safety at home",
        items: [
          "Use fireplaces and appliances only as the host advises, and never leave a fire unattended.",
          "Keep doors and gates secure when you go out and when you are asleep.",
          "Please read our Safety & Emergency Information on arrival.",
        ],
      },
      {
        heading: "Respect for neighbours",
        paras: [
          "Our properties are in residential neighbourhoods. Please keep noise to a considerate level, particularly in the evening and at night.",
        ],
      },
      {
        heading: "Additional rules",
        paras: [
          "Any additional rules for a particular stay, such as quiet hours, pets or smoking, are listed in your booking confirmation.",
        ],
      },
      {
        heading: "If you break a rule",
        paras: [
          "We would always rather talk first. Serious or repeated breaches can lead to a stay being ended early, as set out in our Terms of Service.",
        ],
      },
    ],
  },

  /* ----------------------------------------------------------------- SAFETY */
  {
    slug: "safety",
    title: "Safety & Emergency Information",
    label: "Safety & Emergencies",
    group: "guest",
    footer: true,
    updated: "2026-11-06",
    summary: "Simple things that keep everyone safe during a stay, and who to call if something goes wrong.",
    highlights: [
      "In an emergency, call 999 or 112 first, then tell us.",
      "For anything else, message or call the host on " + brand.phone + ".",
      "Where there is a pool, supervise children and non-swimmers at all times.",
    ],
    sections: [
      {
        heading: "In an emergency",
        items: [
          "Call 999 or 112 for police, fire or ambulance in Kenya.",
          `Then tell the host on ${brand.phone} so we can help and guide emergency services to the property.`,
          "The exact address and the nearest hospital are given in your arrival instructions. Keep them somewhere easy to find.",
        ],
      },
      {
        heading: "Contacting the host",
        paras: [
          `For anything that is not an emergency, such as a fault, a question or something you need, message or call ${brand.phone}. We would much rather hear about a problem early.`,
        ],
      },
      {
        heading: "Fire safety",
        items: [
          "Know where the exits are as soon as you arrive.",
          "Use fireplaces only as the host advises, keep the screen or opening clear, and never leave a fire or candle unattended.",
          "Do not dry clothes or leave fabrics near heaters or fires.",
          "If you smell smoke or gas, leave the building and call 999 or 112.",
        ],
      },
      {
        heading: "Pool safety (where the property has a pool)",
        items: [
          "Children and non-swimmers must be supervised by an adult at all times.",
          "Unless stated otherwise there is no lifeguard on duty.",
          "Keep gates and doors to the pool area closed when it is not in use.",
          "Wet surfaces can be slippery, so please walk rather than run.",
        ],
      },
      {
        heading: "Security",
        items: [
          "Lock doors and close windows when you go out and at night.",
          "Keep valuables out of sight and do not leave gates open.",
          "Please do not give the address or access details to people who are not part of your booking.",
        ],
      },
      {
        heading: "Electricity, water and appliances",
        items: [
          "Please tell us about any exposed wiring, leaks or damaged appliances rather than trying to fix them.",
          "Switch off appliances you are not using before you go out.",
          "If the power or water goes off, tell us and we will help.",
        ],
      },
      {
        heading: "Children and older guests",
        paras: [
          "Some homes have steps, raised platforms or artwork at head height. Please take care with young children and older guests, and tell us before you arrive if anyone has particular needs.",
        ],
      },
      {
        heading: "Reporting an incident",
        paras: [
          "If anyone is hurt or something is damaged, please tell us as soon as you can so we can help and put it on record.",
        ],
      },
    ],
  },

  /* -------------------------------------------------------------------- FAQ */
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    label: "FAQ",
    group: "guest",
    footer: true,
    updated: "2026-11-06",
    summary: "Quick answers about booking, what's included and what to expect.",
    highlights: [
      "No account is needed to book.",
      "You are not charged when you send a request; the host confirms by message.",
      "The exact address is shared after your booking is confirmed.",
    ],
    sections: [
      {
        heading: "Do I need an account to book?",
        paras: ["No. You can choose your dates and send a request without signing up."],
      },
      {
        heading: "How do I book?",
        paras: [
          "Open a stay, pick the option you want, choose your dates and number of guests, then tap Reserve on WhatsApp. A message with your details is prepared for you to send, and the host replies to confirm.",
        ],
      },
      {
        heading: "Am I charged when I send a request?",
        paras: [
          "No. Your booking is confirmed only when the host confirms it in writing and you have paid anything the confirmation asks for. The confirmation tells you how and when to pay.",
        ],
      },
      {
        heading: "Why can't I see the exact address?",
        paras: [
          "To protect the privacy and security of our properties and their neighbours, the exact address is shared only after your booking is confirmed. Until then you can see the neighbourhood and town.",
        ],
      },
      {
        heading: "What can I book?",
        paras: [
          "Each property lists the ways it can be booked, for example a whole home or just part of it. Pick the option you want on the property's page and the calendar updates to show what is free for that option.",
        ],
      },
      {
        heading: "What is included?",
        paras: [
          "Every property page lists its amenities, such as WiFi, kitchen, parking or a pool. What is included differs from home to home, so check the page of the stay you like.",
        ],
      },
      {
        heading: "What are the check-in and check-out times?",
        paras: ["Each property sets its own times. You will find them on the stay's page and in your booking confirmation."],
      },
      {
        heading: "Is there a minimum stay?",
        paras: ["Each property sets its own minimum number of nights, shown on its page. The calendar will not let you pick a shorter stay."],
      },
      {
        heading: "Can I change or cancel my booking?",
        paras: [
          "Yes, subject to the terms in your booking confirmation. Please message us as early as you can. See our Cancellation & Refund Policy for how it works.",
        ],
      },
      {
        heading: "How do reviews work?",
        paras: [
          "Only guests who have completed a stay can review it, and each review is tied to a real booking. See our Reviews Policy.",
        ],
      },
      {
        heading: "How do I contact you?",
        paras: ["Message us on WhatsApp, call, or send an email. We usually reply quickly."],
        contact: true,
      },
    ],
  },
];

export const getLegalDoc = (slug: string) => legalDocs.find((d) => d.slug === slug);

export const formatLegalDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Rough reading time in minutes, from the document's text. */
export function readingMinutes(doc: LegalDoc) {
  const words = doc.sections
    .flatMap((s) => [s.heading, ...(s.paras ?? []), ...(s.items ?? [])])
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

/** Previous and next documents, in list order, for the page footer navigation. */
export function neighbours(slug: string) {
  const i = legalDocs.findIndex((d) => d.slug === slug);
  return { prev: legalDocs[i - 1] ?? null, next: legalDocs[i + 1] ?? null };
}
