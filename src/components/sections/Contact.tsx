import { Mail, MessageCircle, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const whatsappNumber = "972544634923";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  const contactInfo = [
    {
      icon: MessageCircle,
      title: "WhatsApp Only",
      lines: ["054-4634923", "Messages only - No phone calls please"],
      isWhatsApp: true,
    },
    {
      icon: Mail,
      title: "Email Us",
      lines: ["ronisapir61@gmail.com"],
      isWhatsApp: false,
    },
    {
      icon: Clock,
      title: "Response Time",
      lines: ["We reply within 24 hours", "Leave a message anytime"],
      isWhatsApp: false,
    },
  ];

  return (
    <section id="contact" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <span className="inline-block px-4 py-1.5 bg-jade-light text-jade text-sm font-medium rounded-full mb-4">
              Get In Touch
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
              Ready to Start
              <br />
              <span className="text-jade">Your Healing?</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg leading-relaxed mb-10">
              Have questions about our treatments or want to schedule a consultation? 
              Our friendly team is here to help you on your wellness journey.
            </p>

            {/* Contact Cards */}
            <div className="grid sm:grid-cols-3 gap-6">
              {contactInfo.map((item) => (
                <div
                  key={item.title}
                  className={`bg-background rounded-xl p-5 shadow-soft ${item.isWhatsApp ? 'ring-2 ring-green-500/30' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.isWhatsApp ? 'bg-green-500/10' : 'bg-jade/10'}`}>
                    <item.icon className={`w-5 h-5 ${item.isWhatsApp ? 'text-green-600' : 'text-jade'}`} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  {item.lines.map((line, i) => (
                    <p key={i} className={`font-body text-sm ${i === 1 && item.isWhatsApp ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                      {line}
                    </p>
                  ))}
                  {item.isWhatsApp && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Send WhatsApp Message
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-background rounded-2xl p-8 shadow-elevated">
            <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
              Send Us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block font-body text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-jade/50 transition-all"
                  placeholder="Your name"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block font-body text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-jade/50 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block font-body text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-jade/50 transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block font-body text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-jade/50 transition-all resize-none"
                  placeholder="Tell us about your health concerns..."
                />
              </div>

              <Button type="submit" variant="jade" size="lg" className="w-full">
                <Send className="w-5 h-5" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;