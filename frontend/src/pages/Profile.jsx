function Profile() {
  return (
    <div className="profile">
      {/* HERO */}
      <div className="hero">
        <div className="hero-avatar">A</div>
        <div className="hero-hello">Duka Langu</div>
        <div className="hero-sub">Mmiliki wa Duka</div>
      </div>

      <div className="content">
        <div className="note">
          <div className="note-title">Hivi karibuni</div>
          <div className="note-sub">
            Login, roles (mmiliki, mfanyakazi), na usalama wa akaunti.
          </div>
        </div>
      </div>

      <style>{`
        .profile {
          width: 100%;
          min-height: 100vh;
          background: #0A0A0A;
        }

        .hero {
          background: linear-gradient(135deg, #1920A7 0%, #3047CD 50%, #232CC9 100%);
          border-radius: 16px 16px 28px 28px;
          padding: calc(env(safe-area-inset-top, 0px) + 32px) 18px 32px;
          color: #fff;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 12px 32px rgba(25, 32, 167, 0.4);
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
        }

        .hero-avatar {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 800;
          margin: 0 auto 16px;
          position: relative;
          z-index: 1;
        }

        .hero-hello {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin-bottom: 4px;
          position: relative;
          z-index: 1;
        }

        .hero-sub {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          position: relative;
          z-index: 1;
        }

        .content {
          padding: 20px 0;
        }

        .note {
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.25);
          border-radius: 16px;
          padding: 18px;
        }

        .note-title {
          font-size: 13px;
          font-weight: 700;
          color: #F97316;
          margin-bottom: 6px;
        }

        .note-sub {
          font-size: 13px;
          color: #9CA3AF;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}

export default Profile
