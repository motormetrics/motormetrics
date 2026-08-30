import { Card, Chip, Separator, Typography } from "@heroui/react";
import { SOCIAL_URLS } from "@web/config/socials";
import {
  Clock,
  Mail,
  MessageCircle,
  Settings,
  Shield,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  AnimatedCard,
  AnimatedCardGrid,
  AnimatedContainer,
  AnimatedIconWrapper,
  AnimatedSection,
  AnimatedText,
  MaintenancePollingWrapper,
} from "./maintenance-notice.client";

export function MaintenanceNotice() {
  return (
    <MaintenancePollingWrapper>
      <AnimatedContainer>
        {/* Hero Section */}
        <AnimatedSection className="flex flex-col items-center gap-4 text-center">
          <AnimatedIconWrapper>
            <Settings className="size-20 text-accent-strong" />
          </AnimatedIconWrapper>
          <AnimatedText>
            <Typography.Heading level={1}>
              Pit Stop in ProgressBar
            </Typography.Heading>
          </AnimatedText>
          <AnimatedText>
            <Typography.Paragraph color="muted">
              Just like a Formula 1 pit stop, we&apos;re fine-tuning our engines
              to deliver the fastest and most reliable Singapore car market
              insights!
            </Typography.Paragraph>
          </AnimatedText>
        </AnimatedSection>

        {/* Status Section */}
        <AnimatedSection>
          <Card>
            <Card.Content>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-accent-strong" />
                    <Typography.Paragraph>
                      Estimated Completion
                    </Typography.Paragraph>
                  </div>
                  <Chip variant="primary" color="accent" size="lg">
                    2 hours
                  </Chip>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    <div
                      className="size-2 animate-pulse rounded-full bg-accent"
                      style={{ animationDelay: "0s" }}
                    />
                    <div
                      className="size-2 animate-pulse rounded-full bg-accent"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="size-2 animate-pulse rounded-full bg-accent"
                      style={{ animationDelay: "0.4s" }}
                    />
                  </div>
                  <Typography.Paragraph color="muted" size="sm">
                    Maintenance in progress
                  </Typography.Paragraph>
                </div>
                <Typography.Paragraph color="muted" size="sm">
                  We are upgrading our data processing systems for faster
                  analysis
                </Typography.Paragraph>
              </div>
            </Card.Content>
          </Card>
        </AnimatedSection>

        {/* What We're Doing Section */}
        <AnimatedSection className="flex flex-col gap-4">
          <Typography.Heading level={2}>
            What&apos;s Under the Hood?
          </Typography.Heading>
          <AnimatedCardGrid>
            <AnimatedCard>
              <Card>
                <Card.Content className="flex flex-row items-start gap-4">
                  <Zap className="mt-1 size-6 flex-shrink-0 text-accent-strong" />
                  <div>
                    <Typography.Heading level={3}>
                      Performance Boost
                    </Typography.Heading>
                    <Typography.Paragraph color="muted" size="sm">
                      Turbocharging our database for lightning-fast COE trend
                      analysis
                    </Typography.Paragraph>
                  </div>
                </Card.Content>
              </Card>
            </AnimatedCard>
            <AnimatedCard>
              <Card>
                <Card.Content className="flex flex-row items-start gap-4">
                  <Shield className="mt-1 size-6 flex-shrink-0 text-accent-strong" />
                  <div>
                    <Typography.Heading level={3}>
                      Security Updates
                    </Typography.Heading>
                    <Typography.Paragraph color="muted" size="sm">
                      Installing the latest security patches to protect your
                      data
                    </Typography.Paragraph>
                  </div>
                </Card.Content>
              </Card>
            </AnimatedCard>
            <AnimatedCard>
              <Card>
                <Card.Content className="flex flex-row items-start gap-4">
                  <TrendingUp className="mt-1 size-6 flex-shrink-0 text-accent-strong" />
                  <div>
                    <Typography.Heading level={3}>
                      New Features
                    </Typography.Heading>
                    <Typography.Paragraph color="muted" size="sm">
                      Adding advanced analytics for better market predictions
                    </Typography.Paragraph>
                  </div>
                </Card.Content>
              </Card>
            </AnimatedCard>
            <AnimatedCard>
              <Card>
                <Card.Content className="flex flex-row items-start gap-4">
                  <Wrench className="mt-1 size-6 flex-shrink-0 text-accent-strong" />
                  <div>
                    <Typography.Heading level={3}>Bug Fixes</Typography.Heading>
                    <Typography.Paragraph color="muted" size="sm">
                      Fixing minor issues to ensure smooth sailing ahead
                    </Typography.Paragraph>
                  </div>
                </Card.Content>
              </Card>
            </AnimatedCard>
          </AnimatedCardGrid>
        </AnimatedSection>

        <AnimatedSection>
          <Separator />
        </AnimatedSection>

        {/* Contact Section */}
        <AnimatedSection className="flex flex-col gap-4 text-center">
          <Typography.Heading level={3}>
            Need Immediate Assistance?
          </Typography.Heading>
          <Typography.Paragraph>
            While we&apos;re upgrading, our support team is still available for
            urgent inquiries
          </Typography.Paragraph>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="mailto:support@motormetrics.app"
              className="flex items-center gap-2 font-medium text-accent-strong text-sm"
            >
              <Mail className="size-4" />
              support@motormetrics.app
            </Link>
            <span className="hidden text-muted sm:inline">|</span>
            <Link
              href={SOCIAL_URLS.twitter}
              className="flex items-center gap-2 font-medium text-accent-strong text-sm"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="size-4" />
              Follow updates on Twitter
            </Link>
          </div>
        </AnimatedSection>

        {/* Footer Message */}
        <AnimatedSection className="text-center">
          <Typography.Paragraph color="muted" size="sm">
            Thanks for your patience as we race towards a better experience!
          </Typography.Paragraph>
          <Typography.Paragraph color="muted" size="xs">
            This page will automatically refresh when maintenance is complete
          </Typography.Paragraph>
        </AnimatedSection>
      </AnimatedContainer>
    </MaintenancePollingWrapper>
  );
}
