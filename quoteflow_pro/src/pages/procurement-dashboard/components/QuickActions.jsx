import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import Icon from "../../../components/AppIcon";

const QuickActions = ({ pendingApprovals = 0, draftRFQs = 0 }) => {
  const navigate = useNavigate();

  const quickActionItems = [
    {
      title: "Create New RFQ",
      description: "Start a new request for quotation",
      icon: "Plus",
      color: "primary",
      action: () => navigate("/rfq-creation-wizard"),
      variant: "default",
    },

    {
      title: "Compare Quotations",
      description: "Analyze and compare received quotes",
      icon: "BarChart3",
      color: "accent",
      action: () => navigate("/quotation-comparison-table"),
      variant: "outline",
    },
  ];

  const notificationItems = [
    {
      title: "Pending Approvals",
      count: pendingApprovals,
      description: "RFQs awaiting your approval",
      icon: "Clock",
      color: "warning",
      action: () => navigate("/procurement-dashboard?filter=pending"),
      urgent: pendingApprovals > 0,
    },
    {
      title: "Draft RFQs",
      count: draftRFQs,
      description: "Incomplete RFQs to finish",
      icon: "FileText",
      color: "muted",
      action: () => navigate("/procurement-dashboard?filter=draft"),
      urgent: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {/* <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActionItems?.map((item, index) => (
            <div
              key={index}
              className="group p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-soft transition-smooth cursor-pointer"
              onClick={item?.action}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  item?.color === 'primary' ? 'bg-primary/10 text-primary' :
                  item?.color === 'secondary'? 'bg-secondary/10 text-secondary' : 'bg-accent/10 text-accent'
                }`}>
                  <Icon name={item?.icon} size={20} strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-smooth">
                    {item?.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item?.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
      {/* Notifications & Alerts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Notifications & Alerts
        </h3>
        <div className="space-y-3">
          {notificationItems?.map((item, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border transition-smooth cursor-pointer ${
                item?.urgent
                  ? "border-warning/50 bg-warning/5 hover:border-warning hover:bg-warning/10"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              onClick={item?.action}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    item?.color === "warning"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon name={item?.icon} size={16} strokeWidth={2} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-foreground">
                      {item?.title}
                    </h4>
                    {item?.count > 0 && (
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          item?.urgent
                            ? "bg-warning text-warning-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item?.count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item?.description}
                  </p>
                </div>
              </div>
              <Icon
                name="ChevronRight"
                size={16}
                className="text-muted-foreground"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Activity
          </h3>
          <Button variant="ghost" size="sm" iconName="ExternalLink">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-smooth">
            <div className="p-1 bg-success/10 text-success rounded-full">
              <Icon name="Check" size={12} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">
                RFQ-2024-001 approved by Finance Team
              </p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-smooth">
            <div className="p-1 bg-primary/10 text-primary rounded-full">
              <Icon name="FileText" size={12} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">
                New quotation received for Industrial Pumps
              </p>
              <p className="text-xs text-muted-foreground">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-smooth">
            <div className="p-1 bg-warning/10 text-warning rounded-full">
              <Icon name="Clock" size={12} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">
                RFQ-2024-003 deadline approaching (2 days left)
              </p>
              <p className="text-xs text-muted-foreground">6 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
