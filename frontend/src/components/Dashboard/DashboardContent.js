import React, { useState } from 'react';
import FeatureCard from './FeatureCard';
import StatBox from './StatBox';
import {
  XMarkIcon,
  EyeIcon,
  ArrowRightIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const DashboardContent = () => {
  const [showDigitalMenuCard, setShowDigitalMenuCard] = useState(true);
  const [showFeatures, setShowFeatures] = useState(true);

  const featureCards = [
    {
      id: 1,
      title: 'CONNECT YOUR GOOGLE BUSINESS PROFILE',
      description: 'Google Business profilinizi bağlayarak daha fazla müşteriye ulaşın',
      icon: '🔗'
    },
    {
      id: 2,
      title: 'ÖDEMEYİ AKTİFLEŞTİR',
      description: 'Online ödeme sistemini aktifleştirin',
      icon: '💳'
    },
    {
      id: 3,
      title: 'REZERVASYON ALIN',
      description: 'Müşterilerinizin rezervasyon yapmasını sağlayın',
      icon: '📅'
    },
    {
      id: 4,
      title: 'İLK MENÜNÜ OLUŞTUR',
      description: 'Dijital menünüzü oluşturmaya başlayın',
      icon: '📋'
    },
    {
      id: 5,
      title: 'MEKAN LOGONU EKLE',
      description: 'Markanızı yansıtan logo ekleyin',
      icon: '🏪'
    },
    {
      id: 6,
      title: 'TASARIMINI KİŞİSELLEŞTİR',
      description: 'Menünüzün görünümünü özelleştirin',
      icon: '🎨'
    }
  ];

  const todayStats = [
    { label: 'Gelir', value: '₺0.00', icon: CurrencyDollarIcon, color: 'green' },
    { label: 'Ort. Sipariş Tutarı', value: '₺0.00', icon: ChartBarIcon, color: 'blue' },
    { label: 'Siparişler', value: '0', icon: ShoppingCartIcon, color: 'orange' },
    { label: 'Oturumlar', value: '0', icon: UsersIcon, color: 'purple' }
  ];

  return (
    <div className="dashboard-content">
      <div className="content-wrapper">
        {/* Main Content */}
        <div className="main-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="date-time">
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <h1 className="welcome-title">ww, Hoş geldin!</h1>
          </div>

          {/* Digital Menu Ready Card */}
          {showDigitalMenuCard && (
            <div className="digital-menu-card">
              <button 
                className="close-btn"
                onClick={() => setShowDigitalMenuCard(false)}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              
              <div className="card-content">
                <div className="card-text">
                  <h3>Your digital menu is ready!</h3>
                  <p>Müşterileriniz artık QR kod ile menünüze erişebilir. Menünüzü önizlemek için aşağıdaki butona tıklayın.</p>
                  <button className="preview-btn">
                    <EyeIcon className="w-5 h-5" />
                    Preview
                  </button>
                </div>
                
                <div className="card-visual">
                  <div className="qr-code-placeholder">
                    <div className="qr-code">
                      <div className="qr-pattern"></div>
                    </div>
                    <span className="scan-text">Scan me</span>
                  </div>
                  <div className="mobile-preview">
                    <div className="mobile-frame">
                      <div className="mobile-screen"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Discover Features Section */}
          {showFeatures && (
            <div className="discover-features">
              <h2 className="section-title">DAHA İYİ BİR DENEYİM İÇİN TÜM ÖZELLİKLERİ KEŞFET</h2>
              
              <div className="features-grid">
                {featureCards.map((feature) => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
              </div>
              
              <button 
                className="hide-features-btn"
                onClick={() => setShowFeatures(false)}
              >
                Gizle
              </button>
            </div>
          )}

          {/* Today's Stats Section */}
          <div className="today-stats">
            <div className="stats-header">
              <h2>Bugün</h2>
              <a href="#" className="reports-link">
                Raporlar <ArrowRightIcon className="w-4 h-4" />
              </a>
            </div>
            
            <div className="stats-grid">
              {todayStats.map((stat, index) => (
                <StatBox key={index} stat={stat} />
              ))}
            </div>
          </div>

          {/* Recent Reviews Section */}
          <div className="recent-reviews">
            <div className="reviews-header">
              <h2>Recent Reviews</h2>
              <a href="#" className="view-all-link">
                Tümünü Görüntüle <ArrowRightIcon className="w-4 h-4" />
              </a>
            </div>
            
            <div className="reviews-placeholder">
              <div className="upgrade-prompt">
                <StarIcon className="w-12 h-12 text-yellow-400" />
                <p>İncelemeler özelliğini edinmek için hesabınızı yükseltin</p>
                <button className="upgrade-btn">Yükselt</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          {/* Google Business Profile Card */}
          <div className="google-business-card">
            <div className="card-background"></div>
            <div className="google-logo">G</div>
            <h3>Google Business Profile</h3>
            <p>Google Business profilinizi bağlayarak daha fazla müşteriye ulaşın</p>
            <div className="card-actions">
              <button className="later-btn">Daha Sonra</button>
              <button className="connect-btn">Bağlantı</button>
            </div>
          </div>

          {/* Customer Success Chat Widget */}
          <div className="chat-widget">
            <div className="chat-header">
              <h4>Customer Success Team</h4>
            </div>
            <div className="chat-content">
              <p>Merhaba! Size nasıl yardımcı olabiliriz?</p>
            </div>
          </div>

          {/* FineDine Rezervasyon Promo */}
          <div className="promo-card">
            <h4>FineDine Rezervasyon!</h4>
            <p>Rezervasyon sisteminizi aktifleştirin</p>
            <button className="promo-btn">Başlayın</button>
          </div>
        </div>
      </div>

      {/* Bottom Onboarding Progress */}
      <div className="onboarding-progress">
        <div className="progress-content">
          <span className="progress-text">FineDine'ı Kullanmaya Başlayın!</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '0%' }}></div>
          </div>
          <span className="progress-percentage">0%</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
