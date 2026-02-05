# CardCraft - AI-Powered Digital Business Cards

Create stunning, customizable digital business cards using AI-powered design generation with structured scaffold architecture.

## 🎯 Concept

CardCraft differentiates from existing digital card builders through **LLM-powered customization within structured scaffolds**. Instead of limiting users to preset templates, CardCraft uses:

- **Scaffold Architecture**: Proven template structures with intelligent "sockets"
- **AI Customization**: LLM generates unique styles, animations, and designs
- **Unlimited Range**: Nearly infinite design possibilities within functional constraints
- **Context Injection**: User data seamlessly integrated into AI-generated designs

## 🏗️ Architecture

### Scaffold System

Each template is a **scaffold** - a proven structure with customizable **sockets**:

```javascript
{
  structure: "HTML template with {{SOCKET_NAME}} placeholders",
  sockets: {
    SOCKET_CUSTOM_STYLES: {
      type: 'css',
      llmPrompt: 'Generate CSS based on user preferences',
      required: true
    }
  },
  contextVariables: ['FULL_NAME', 'EMAIL', ...]
}
```

### Socket Types

1. **Context Variables** - Simple text replacement (name, email, etc.)
2. **CSS Sockets** - AI-generated styling and animations
3. **HTML Sockets** - AI-generated markup and structure
4. **JavaScript Sockets** - AI-generated interactions (within constraints)

### Generation Flow

```
User Input → LLM Prompt Builder → AI Generation → Socket Assembly → Final Card
```

## 🎨 Templates

### 1. Modern Tech
- Animated particles background
- Gradient effects
- Tech-focused aesthetic
- PWA-ready structure

### 2. Minimal
- Clean, simple design
- Focus on content
- Subtle animations
- Fast loading

### 3. Creative
- Bold, artistic layouts
- Unique design elements
- Expressive styling
- Portfolio-focused

### 4. Business Professional
- Traditional corporate design
- Professional color schemes
- Structured information
- Trust-building elements

## 🚀 Features

- **AI-Powered Design**: LLM generates custom styles based on natural language descriptions
- **Scaffold Architecture**: Reliable structure with unlimited customization
- **Instant Generation**: Cards created in seconds
- **PWA Support**: Every card is installable as a Progressive Web App
- **QR Code Sharing**: Automatic QR code generation
- **vCard Export**: Download contact information
- **One-Click Deploy**: (Coming soon) Deploy to live URL instantly

## 💻 Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI Integration**: Ready for OpenAI/Anthropic API integration
- **Deployment**: Netlify-ready
- **No Build Step**: Pure client-side generation

## 🔧 Development

### Local Development

```bash
# Serve locally
python -m http.server 8080
# or
npx serve
```

### Deployment

```bash
netlify deploy --prod --dir .
```

## 📋 Roadmap

- [ ] OpenAI API integration for real LLM generation
- [ ] Advanced template editor
- [ ] Custom domain support
- [ ] Analytics dashboard
- [ ] Team collaboration features
- [ ] Template marketplace
- [ ] A/B testing for designs
- [ ] Custom animation library

## 🎯 Key Differentiators

1. **LLM-Powered Customization**: Not just preset templates - AI creates unique designs
2. **Scaffold Architecture**: Proven structure ensures reliability while allowing creativity
3. **Natural Language**: Describe your vision, AI builds it
4. **Socket System**: Modular, maintainable, extensible
5. **No Design Skills Required**: AI handles the complex work

## 📝 License

All rights reserved - CardCraft by AI Alchemist

## 🤝 Credits

Built with ❤️ by [AI Alchemist](https://www.aialchemist.net)

---

*Craft Your Digital Identity*
