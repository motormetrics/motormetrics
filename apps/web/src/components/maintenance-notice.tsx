import { Card, Chip, Link, Separator, Text } from "@heroui/react";
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
            <Settings className="size-20 text-accent" />
          </AnimatedIconWrapper>
          <AnimatedText>
            <Text type="h1">Pit Stop in ProgressBar</Text>
          </AnimatedText>
          <AnimatedText>
            <Text type="body">
              Just like a Formula 1 pit stop, we&apos;re fine-tuning our engines
              to deliver the fastest and most reliable Singapore car market
              insights!
            </Text>
          </AnimatedText>
        </AnimatedSection>

        {/* Status Section */}
        <AnimatedSection>
          <Card>
            <Card.Content>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-accent" />
                    <Text type="body">Estimated Completion</Text>
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
                  <Text type="body-sm" color="muted">
                    Maintenance in progress
                  </Text>
                </div>
                <Text type="body-sm" color="muted">
                  We are upgrading our data processing systems for faster
                  analysis
                </Text>
              </div>
            </Card.Content>
          </Card>
        </AnimatedSection>

        {/* What We're Doing Section */}
        <AnimatedSection className="flex flex-col gap-4">
          <Text type="h2">What&apos;s Under the Hood?</Text>
          <AnimatedCardGrid>
            <AnimatedCard>
              <Card>
                <Card.Content className="flex flex-row items-start gap-4">
                  <Zap className="mt-1 size-6 flex-shrink-0 text-accent" />
                  <div>
                    <Text type="h3">Performance Boost</Text>
                    <Text type="body-sm" color="muted">
                      Turbocharging our database for lightning-fast COE trend
                      analysis
                    </Text>
                  </div>
                </Card.Content>
              </Card>
            </AnimatedCard>
            <AnimatedCard>
              <Card>
                <Card.Content className="flex flex-row items-start gap-4">
                  <Shield className="mt-1 size-6 flex-shrink-0 text-accent" />
                  <div>
                    <Text type="h3">Security Updates</Text>
                    <Text type="body-sm" color="muted">
                      Installing the latest security patches to protect your
                      data
                    </Text>
                  </div>
                </Card.Content>
              </Card>
            </AnimatedCard>
            <AnimatedCard>
              <Card>
                <Card.Content className="flex flex-row items-start gap-4">
                  <TrendingUp className="mt-1 size-6 flex-shrink-0 text-accent" />
                  <div>
                    <Text type="h3">New Features</Text>
                    <Text type="body-sm" color="muted">
                      Adding advanced analytics for better market predictions
                    </Text>
                  </div>
                </Card.Content>
              </Card>
            </AnimatedCard>
            <AnimatedCard>
              <Card>
                <Card.Content className="flex flex-row items-start gap-4">
                  <Wrench className="mt-1 size-6 flex-shrink-0 text-accent" />
                  <div>
                    <Text type="h3">Bug Fixes</Text>
                    <Text type="body-sm" color="muted">
                      Fixing minor issues to ensure smooth sailing ahead
                    </Text>
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
          <Text type="h3">Need Immediate Assistance?</Text>
          <Text type="body">
            While we&apos;re upgrading, our support team is still available for
            urgent inquiries
          </Text>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="mailto:support@motormetrics.app"
              className="flex items-center gap-2 font-medium text-accent text-sm"
            >
              <Mail className="size-4" />
              support@motormetrics.app
            </Link>
            <span className="hidden text-muted sm:inline">|</span>
            <Link
              href={SOCIAL_URLS.twitter}
              className="flex items-center gap-2 font-medium text-accent text-sm"
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
          <Text type="body-sm" color="muted">
            Thanks for your patience as we race towards a better experience!
          </Text>
          <Text type="body-xs" color="muted">
            This page will automatically refresh when maintenance is complete
          </Text>
        </AnimatedSection>
      </AnimatedContainer>
    </MaintenancePollingWrapper>
  );
}
