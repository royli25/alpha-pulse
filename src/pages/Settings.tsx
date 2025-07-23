
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  User, 
  Bell, 
  CreditCard, 
  Shield, 
  Globe,
  Smartphone,
  Mail,
  Crown
} from "lucide-react"

export default function Settings() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and notification settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Alex" className="rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Chen" className="rounded-xl" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="alex.chen@example.com" className="rounded-xl" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc-5">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc-5">UTC-5 (Eastern)</SelectItem>
                      <SelectItem value="utc-6">UTC-6 (Central)</SelectItem>
                      <SelectItem value="utc-7">UTC-7 (Mountain)</SelectItem>
                      <SelectItem value="utc-8">UTC-8 (Pacific)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="jpy">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">High Confidence Signals</div>
                    <div className="text-sm text-muted-foreground">
                      Get notified when signals have 85%+ confidence
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Market Alerts</div>
                    <div className="text-sm text-muted-foreground">
                      Important market events and news
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Portfolio Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Changes to your watchlist and portfolio
                    </div>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Weekly Summary</div>
                    <div className="text-sm text-muted-foreground">
                      Performance recap every Sunday
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-3">Delivery Preferences</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 border border-border rounded-xl">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-xs text-muted-foreground">alex.chen@example.com</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border border-border rounded-xl">
                    <Smartphone className="w-5 h-5 text-secondary" />
                    <div>
                      <div className="font-medium">Push</div>
                      <div className="text-xs text-muted-foreground">Mobile app</div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Display Preferences */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Display</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="density">Display Density</Label>
                <Select defaultValue="comfortable">
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Show Confidence Scores</div>
                  <div className="text-sm text-muted-foreground">
                    Display AI confidence percentages on signal cards
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Animate Transitions</div>
                  <div className="text-sm text-muted-foreground">
                    Smooth animations and hover effects
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span>Pro Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">$49</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Real-time signals</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    ✓
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Advanced filters</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    ✓
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>API access</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    ✓
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Priority support</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                    ✓
                  </Badge>
                </div>
              </div>
              
              <Button variant="outline" className="w-full rounded-xl">
                Manage Billing
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Two-Factor Auth</div>
                  <div className="text-xs text-muted-foreground">SMS verification</div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">API Key Access</div>
                  <div className="text-xs text-muted-foreground">Programmatic access</div>
                </div>
                <Switch />
              </div>
              
              <Button variant="outline" className="w-full rounded-xl">
                Change Password
              </Button>
              
              <Button variant="outline" className="w-full rounded-xl text-red-400 border-red-500/30">
                Download Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
