import React, { useState, useMemo } from 'react';
import { X, Search, Zap, Smartphone, ShoppingCart, Sparkles, TrendingUp, Clock, BarChart3, CheckCircle } from 'lucide-react';
import { TemplatesLibraryProps, Template, TemplateFilter } from '../types';

/**
 * Section 2: Smart Templates Library Component
 *
 * Features:
 * - Pre-built templates for common product types
 * - SaaS, Mobile App, E-commerce templates
 * - Examples and guidance for each template
 * - Search and filter functionality
 * - RTL support for Arabic
 * - Goal: 70% of beginners complete their first PRD
 */

const TemplatesLibrary: React.FC<TemplatesLibraryProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  locale = 'en-US'
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [filter, setFilter] = useState<TemplateFilter>({
    category: 'all',
    difficulty: 'all',
    searchQuery: ''
  });

  const isRTL = locale === 'ar-EG';

  // Template data
  const templates: Template[] = [
    {
      id: 'saas-product',
      name: 'SaaS Product Template',
      nameAr: 'قالب منتج SaaS',
      description: 'Perfect for cloud-based software services with subscription models',
      descriptionAr: 'مثالي للخدمات البرمجية السحابية مع نماذج الاشتراك',
      category: 'saas',
      icon: '💼',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      content: {
        productName: 'TeamSync Pro',
        productDescription: 'A collaborative project management platform for remote teams',
        targetUsers: 'Remote teams (5-50 members), project managers, and team leaders',
        problemStatement: 'Remote teams struggle with visibility, async communication, and task tracking',
        keyFeatures: [
          'Real-time collaboration dashboard',
          'Task assignment and tracking',
          'Video conferencing integration',
          'Automated progress reports',
          'Mobile app for iOS and Android'
        ],
        successMetrics: [
          'Reduce status meeting time by 40%',
          'Increase team productivity by 25%',
          'Achieve 90% user satisfaction score',
          '50% monthly active user growth'
        ]
      },
      examples: [
        {
          title: 'Feature Example: Real-time Dashboard',
          titleAr: 'مثال الميزة: لوحة التحكم في الوقت الفعلي',
          description: 'Live updates of team activities, tasks, and project progress',
          descriptionAr: 'تحديثات مباشرة لأنشطة الفريق والمهام وتقدم المشروع'
        },
        {
          title: 'Success Metric Example',
          titleAr: 'مثال مقياس النجاح',
          description: 'Track daily active users, task completion rate, and response time',
          descriptionAr: 'تتبع المستخدمين النشطين يومياً ومعدل إنجاز المهام ووقت الاستجابة'
        }
      ],
      tips: [
        'Focus on async-first features for global teams',
        'Include integration with popular tools (Slack, Zoom)',
        'Design for mobile-first experience',
        'Add data privacy and security features'
      ],
      tipsAr: [
        'ركز على الميزات غير المتزامنة للفرق العالمية',
        'قم بتضمين التكامل مع الأدوات الشائعة (Slack, Zoom)',
        'صمم لتجربة الهاتف المحمول أولاً',
        'أضف ميزات الخصوصية والأمان'
      ],
      difficulty: 'intermediate',
      estimatedTime: '20-30 minutes',
      popularity: 95
    },
    {
      id: 'mobile-app',
      name: 'Mobile App Template',
      nameAr: 'قالب تطبيق الهاتف المحمول',
      description: 'Ideal for native or cross-platform mobile applications',
      descriptionAr: 'مثالي للتطبيقات الأصلية أو متعددة المنصات',
      category: 'mobile',
      icon: '📱',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
      content: {
        productName: 'FitTrack',
        productDescription: 'A comprehensive fitness and wellness tracking mobile app',
        targetUsers: 'Health-conscious individuals aged 18-45, fitness enthusiasts, personal trainers',
        problemStatement: 'Users struggle to maintain consistent fitness routines and track their progress effectively',
        keyFeatures: [
          'Personalized workout plans',
          'Nutrition tracking with barcode scanner',
          'Progress photos and measurements',
          'Social challenges and leaderboards',
          'Integration with wearable devices'
        ],
        successMetrics: [
          '70% 30-day retention rate',
          '10,000 downloads in first month',
          '4.5+ app store rating',
          'Average session time of 15+ minutes'
        ]
      },
      examples: [
        {
          title: 'Feature Example: Workout Plans',
          titleAr: 'مثال الميزة: خطط التمرين',
          description: 'AI-generated personalized workout plans based on user goals and fitness level',
          descriptionAr: 'خطط تمرين مخصصة تم إنشاؤها بواسطة الذكاء الاصطناعي بناءً على أهداف المستخدم ومستوى اللياقة البدنية'
        },
        {
          title: 'Engagement Feature: Challenges',
          titleAr: 'ميزة المشاركة: التحديات',
          description: 'Weekly fitness challenges with friends to boost motivation',
          descriptionAr: 'تحديات لياقة أسبوعية مع الأصدقاء لزيادة الحافز'
        }
      ],
      tips: [
        'Prioritize offline functionality',
        'Use push notifications strategically',
        'Keep UI simple and intuitive',
        'Add gamification elements for engagement'
      ],
      tipsAr: [
        'أعط الأولوية للوظائف دون اتصال بالإنترنت',
        'استخدم الإشعارات الفورية بشكل استراتيجي',
        'اجعل واجهة المستخدم بسيطة وبديهية',
        'أضف عناصر اللعب للمشاركة'
      ],
      difficulty: 'beginner',
      estimatedTime: '15-25 minutes',
      popularity: 88
    },
    {
      id: 'ecommerce-platform',
      name: 'E-commerce Platform Template',
      nameAr: 'قالب منصة التجارة الإلكترونية',
      description: 'Complete template for online shopping and marketplace platforms',
      descriptionAr: 'قالب كامل لمنصات التسوق عبر الإنترنت والسوق',
      category: 'ecommerce',
      icon: '🛒',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
      content: {
        productName: 'EcoMarket',
        productDescription: 'A sustainable marketplace for eco-friendly and ethical products',
        targetUsers: 'Environmentally conscious consumers aged 25-45, sustainable brands, small businesses',
        problemStatement: 'Consumers want to shop sustainably but struggle to find verified eco-friendly products',
        keyFeatures: [
          'Product sustainability scoring system',
          'Vendor verification and certification',
          'Carbon-neutral shipping options',
          'Customer reviews and ratings',
          'Mobile app and web platform',
          'Secure payment processing'
        ],
        successMetrics: [
          'Process $100K GMV in first quarter',
          'Onboard 50+ verified sustainable brands',
          'Achieve 3% conversion rate',
          'Maintain 4.7+ customer satisfaction score'
        ]
      },
      examples: [
        {
          title: 'Feature Example: Sustainability Score',
          titleAr: 'مثال الميزة: نقاط الاستدامة',
          description: 'Each product gets a score based on carbon footprint, materials, and ethics',
          descriptionAr: 'كل منتج يحصل على نقاط بناءً على البصمة الكربونية والمواد والأخلاقيات'
        },
        {
          title: 'Trust Feature: Vendor Verification',
          titleAr: 'ميزة الثقة: التحقق من البائع',
          description: 'Third-party certification process for sellers to ensure authenticity',
          descriptionAr: 'عملية تصديق من طرف ثالث للبائعين لضمان الأصالة'
        }
      ],
      tips: [
        'Focus on trust and security features',
        'Optimize for fast checkout process',
        'Include detailed product filtering',
        'Add wishlist and comparison features',
        'Implement abandoned cart recovery'
      ],
      tipsAr: [
        'ركز على ميزات الثقة والأمان',
        'قم بتحسين عملية الدفع السريعة',
        'قم بتضمين تصفية المنتجات التفصيلية',
        'أضف ميزات قائمة الأمنيات والمقارنة',
        'قم بتطبيق استعادة عربة التسوق المهجورة'
      ],
      difficulty: 'advanced',
      estimatedTime: '30-45 minutes',
      popularity: 92
    }
  ];

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = filter.category === 'all' || template.category === filter.category;
      const matchesDifficulty = filter.difficulty === 'all' || template.difficulty === filter.difficulty;
      const matchesSearch = !filter.searchQuery ||
        template.name.toLowerCase().includes(filter.searchQuery.toLowerCase()) ||
        template.nameAr.includes(filter.searchQuery) ||
        template.description.toLowerCase().includes(filter.searchQuery.toLowerCase());

      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  }, [templates, filter]);

  // Handle template selection
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  // Handle use template
  const handleUseTemplate = () => {
    if (selectedTemplate) {
      // Save analytics
      localStorage.setItem('prd-last-used-template', selectedTemplate.id);
      const usageHistory = JSON.parse(localStorage.getItem('prd-template-usage') || '[]');
      usageHistory.push({
        templateId: selectedTemplate.id,
        usedAt: new Date().toISOString()
      });
      localStorage.setItem('prd-template-usage', JSON.stringify(usageHistory));

      onSelectTemplate(selectedTemplate);
      onClose();
    }
  };

  // Get difficulty badge
  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      beginner: { text: isRTL ? 'مبتدئ' : 'Beginner', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      intermediate: { text: isRTL ? 'متوسط' : 'Intermediate', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      advanced: { text: isRTL ? 'متقدم' : 'Advanced', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    };
    return badges[difficulty as keyof typeof badges] || badges.beginner;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden ${
          isRTL ? 'rtl' : 'ltr'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles size={32} />
              <div>
                <h2 className="text-2xl font-bold">
                  {isRTL ? 'مكتبة القوالب الذكية' : 'Smart Templates Library'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isRTL ? 'ابدأ بسرعة باستخدام القوالب الجاهزة' : 'Get started quickly with pre-built templates'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={isRTL ? 'ابحث عن القوالب...' : 'Search templates...'}
                value={filter.searchQuery}
                onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value as any })}
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all">{isRTL ? 'كل الفئات' : 'All Categories'}</option>
              <option value="saas">SaaS</option>
              <option value="mobile">{isRTL ? 'تطبيق محمول' : 'Mobile'}</option>
              <option value="ecommerce">{isRTL ? 'تجارة إلكترونية' : 'E-commerce'}</option>
            </select>

            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value as any })}
              className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all">{isRTL ? 'كل المستويات' : 'All Levels'}</option>
              <option value="beginner">{isRTL ? 'مبتدئ' : 'Beginner'}</option>
              <option value="intermediate">{isRTL ? 'متوسط' : 'Intermediate'}</option>
              <option value="advanced">{isRTL ? 'متقدم' : 'Advanced'}</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Templates List */}
          <div className={`lg:col-span-${selectedTemplate ? '1' : '3'} grid grid-cols-1 ${!selectedTemplate && 'md:grid-cols-2 xl:grid-cols-3'} gap-4`}>
            {filteredTemplates.map((template) => {
              const difficultyBadge = getDifficultyBadge(template.difficulty);
              return (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`text-left p-5 rounded-xl border-2 transition-all hover:shadow-lg ${
                    selectedTemplate?.id === template.id
                      ? `border-${template.color}-500 bg-${template.color}-50 dark:bg-${template.color}-900/20 shadow-md`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-4xl">{template.icon}</span>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyBadge.color}`}>
                        {difficultyBadge.text}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp size={12} />
                        <span>{template.popularity}%</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    {isRTL ? template.nameAr : template.name}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {isRTL ? template.descriptionAr : template.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={14} />
                    <span>{template.estimatedTime}</span>
                  </div>
                </button>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🔍</div>
                <p className="text-gray-500 dark:text-gray-400">
                  {isRTL ? 'لم يتم العثور على قوالب' : 'No templates found'}
                </p>
              </div>
            )}
          </div>

          {/* Template Details */}
          {selectedTemplate && (
            <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{selectedTemplate.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isRTL ? selectedTemplate.nameAr : selectedTemplate.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isRTL ? selectedTemplate.descriptionAr : selectedTemplate.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Content Preview */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText size={18} />
                    {isRTL ? 'محتوى القالب' : 'Template Content'}
                  </h4>
                  <div className="bg-white dark:bg-gray-900 rounded-lg p-4 space-y-3 text-sm">
                    <div>
                      <strong className="text-gray-700 dark:text-gray-300">{isRTL ? 'اسم المنتج:' : 'Product Name:'}</strong>
                      <p className="text-gray-600 dark:text-gray-400">{selectedTemplate.content.productName}</p>
                    </div>
                    <div>
                      <strong className="text-gray-700 dark:text-gray-300">{isRTL ? 'الميزات الرئيسية:' : 'Key Features:'}</strong>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1">
                        {selectedTemplate.content.keyFeatures.slice(0, 3).map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles size={18} />
                    {isRTL ? 'أمثلة' : 'Examples'}
                  </h4>
                  <div className="space-y-2">
                    {selectedTemplate.examples.map((example, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-3">
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                          {isRTL ? example.titleAr : example.title}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {isRTL ? example.descriptionAr : example.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Zap size={18} />
                    {isRTL ? 'نصائح' : 'Tips'}
                  </h4>
                  <ul className="space-y-2">
                    {(isRTL ? selectedTemplate.tipsAr : selectedTemplate.tips).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleUseTemplate}
                  className={`w-full py-3 bg-gradient-to-r ${selectedTemplate.gradient} text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                >
                  <CheckCircle size={20} />
                  {isRTL ? 'استخدم هذا القالب' : 'Use This Template'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add FileText import
import { FileText } from 'lucide-react';

export default TemplatesLibrary;
