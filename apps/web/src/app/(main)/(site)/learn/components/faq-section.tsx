"use client";

import { Accordion, Card, Text } from "@heroui/react";

import { SITE_TITLE } from "@web/config";
import {
  fadeInUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Car,
  FileText,
  Landmark,
  MessageCircleQuestion,
  Zap,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionData {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  items: FAQItem[];
}

export const FAQ_SECTIONS: FAQSectionData[] = [
  {
    title: "Certificate of Entitlement (COE)",
    icon: Landmark,
    iconColor: "text-accent",
    items: [
      {
        question: "What is COE in Singapore?",
        answer:
          "Certificate of Entitlement (COE) is a quota licence required in Singapore to own a vehicle. It gives the holder the right to register, purchase and use a vehicle in Singapore for a period of 10 years. The COE system was introduced in May 1990 to control vehicle population growth and manage traffic congestion.",
      },
      {
        question: "How does COE bidding work?",
        answer:
          "COE bidding exercises are held twice monthly, typically on the first and third Wednesday of each month. Bidders submit their bids for different vehicle categories through authorised dealers or online platforms. COE is awarded to the highest bidders up to the quota available for each category. The lowest successful bid becomes the COE price for that category.",
      },
      {
        question: "What are the COE categories?",
        answer:
          "There are 5 COE categories: Category A (cars up to 1,600cc and 130bhp, electric cars with power up to 110kW), Category B (cars above 1,600cc or 130bhp, electric cars with power above 110kW), Category C (goods vehicles and buses), Category D (motorcycles), and Category E (open category for all vehicle types).",
      },
      {
        question: "How long is COE valid?",
        answer:
          "COE is valid for 10 years from the date of vehicle registration. After 10 years, vehicle owners must either renew their COE for another 5 or 10 years by paying the Prevailing Quota Premium (PQP), or deregister their vehicle.",
      },
      {
        question: "What affects COE prices?",
        answer:
          "COE prices are determined by supply and demand. Key factors include the monthly quota set by the government (based on vehicle scrappage and target vehicle population growth), economic conditions, consumer confidence, interest rates, and seasonal demand patterns. External factors like global chip shortages or new model launches can also influence demand.",
      },
    ],
  },
  {
    title: "Car Registration and Market Trends",
    icon: Car,
    iconColor: "text-success",
    items: [
      {
        question: "How often is car registration data updated?",
        answer:
          "Car registration data is updated monthly following the Land Transport Authority's (LTA) official data releases. The data typically becomes available 2-3 weeks after the end of each month and includes comprehensive breakdowns by manufacturer, fuel type, and vehicle category.",
      },
      {
        question: `What data sources does ${SITE_TITLE} use?`,
        answer:
          "All vehicle registration and COE data is sourced directly from Singapore's Land Transport Authority (LTA), ensuring accuracy and official government backing. We process and format this data to provide insights and analytics for easier understanding of market trends.",
      },
      {
        question: "Why do some months show higher car registrations?",
        answer:
          "Car registration patterns can vary due to several factors including COE price fluctuations, new model launches, promotional periods by dealers, economic conditions, and seasonal buying patterns. Lower COE prices or attractive financing options typically lead to higher registrations.",
      },
    ],
  },
  {
    title: "Electric and Hybrid Vehicles",
    icon: Zap,
    iconColor: "text-warning",
    items: [
      {
        question: "How are electric vehicles categorised for COE?",
        answer:
          "Electric vehicles are categorised based on their power output: those with power up to 110kW fall under Category A, while those with power above 110kW are placed in Category B. This system treats electric vehicles similarly to petrol cars based on their performance characteristics.",
      },
      {
        question: "What incentives exist for electric vehicles?",
        answer:
          "Singapore offers various incentives for electric vehicles including rebates under the Electric Vehicle Early Adoption Incentive (EEAI), additional registration fee (ARF) rebates, and road tax concessions. The government aims to phase out internal combustion engine vehicles by 2040.",
      },
    ],
  },
  {
    title: "PARF and Vehicle Deregistration",
    icon: FileText,
    iconColor: "text-muted",
    items: [
      {
        question: "What is PARF?",
        answer:
          "The Preferential Additional Registration Fee (PARF) is a rebate given when you deregister a vehicle before its COE expires. It is calculated as a percentage of the Additional Registration Fee (ARF) paid at registration, with the percentage decreasing as the vehicle ages. No PARF rebate is given for vehicles older than 10 years.",
      },
      {
        question: "What changed with PARF in Budget 2026?",
        answer:
          "Budget 2026 reduced PARF rebate percentages by 45 percentage points across all vehicle age brackets. For example, vehicles aged 5 years or younger now receive 30% of ARF (down from 75%). The rebate cap was also halved from $60,000 to $30,000. These changes apply to vehicles registered with COEs obtained from the 2nd bidding exercise in February 2026 onwards.",
      },
      {
        question: "How is the PARF rebate calculated?",
        answer:
          "The PARF rebate equals a percentage of the ARF you paid when registering the vehicle, based on the vehicle's age at deregistration. Under the new rates (effective Feb 2026): 30% for vehicles 5 years and younger, 25% for >5-6 years, 20% for >6-7 years, 15% for >7-8 years, 10% for >8-9 years, 5% for >9-10 years, and nil for vehicles over 10 years. The rebate is capped at $30,000.",
      },
    ],
  },
  {
    title: `Using ${SITE_TITLE}`,
    icon: BarChart3,
    iconColor: "text-accent",
    items: [
      {
        question: "How can I access historical data?",
        answer:
          "Historical data is available through our website's month selector feature on various pages. You can also access our API endpoints for programmatic access to historical car registration and COE data dating back to 2020.",
      },
    ],
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="scroll-mt-24 py-20 lg:py-28">
      <div className="container mx-auto">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left column - Sticky header */}
          <div className="lg:col-span-4">
            <motion.div
              className="sticky top-24 flex flex-col gap-6"
              variants={fadeInUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <Text type="body-sm" weight="medium">
                Common Questions
              </Text>
              <Text type="h2">Frequently Asked Questions</Text>
              <Text type="body">
                Everything you need to know about Singapore&apos;s vehicle
                market, from COE bidding to PARF rebates.
              </Text>
            </motion.div>
          </div>

          {/* Right column - FAQ categories */}
          <div className="lg:col-span-8">
            <motion.div
              className="flex flex-col gap-8"
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {FAQ_SECTIONS.map((section) => (
                <motion.div
                  key={section.title}
                  className="flex flex-col gap-4"
                  variants={staggerItemVariants}
                >
                  <div className="flex items-center gap-3">
                    <section.icon className={`size-5 ${section.iconColor}`} />
                    <Text type="h3">{section.title}</Text>
                  </div>
                  <Accordion>
                    {section.items.map(({ answer, question }) => (
                      <Accordion.Item key={question}>
                        <Accordion.Heading>
                          <Accordion.Trigger>
                            {question}
                            <Accordion.Indicator />
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          <Accordion.Body>
                            <Text type="body">{answer}</Text>
                          </Accordion.Body>
                        </Accordion.Panel>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </motion.div>
              ))}

              {/* Still Have Questions? */}
              <motion.div variants={staggerItemVariants}>
                <Card className="border border-accent/20 bg-accent/5">
                  <Card.Content className="flex flex-row items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                      <MessageCircleQuestion className="size-5 text-accent" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Text type="h4">Still Have Questions?</Text>
                      <Text type="body-sm" color="muted">
                        If you have additional questions about Singapore&apos;s
                        automotive market or need help understanding specific
                        data points, feel free to explore our comprehensive car
                        registration and COE data through the navigation menu
                        above.
                      </Text>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
