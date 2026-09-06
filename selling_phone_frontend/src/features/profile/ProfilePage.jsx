import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { authApi } from '../../api/authApi.js';

export function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    authApi
      .profile()
      .then((response) => setProfile(response.data))
      .catch((err) => setError(err.message || 'Khong tai duoc ho so'));
  }, []);

  return (
    <section className="page-section narrow">
      <div className="profile-panel">
        <div className="profile-avatar">
          {profile?.avatar ? <img src={profile.avatar} alt={profile.fullName || profile.username} /> : <UserRound />}
        </div>
        {error && <div className="form-message error">{error}</div>}
        {profile && (
          <>
            <h1>{profile.fullName || profile.username}</h1>
            <dl className="profile-list">
              <div>
                <dt>Ten dang nhap</dt>
                <dd>{profile.username}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div>
                <dt>So dien thoai</dt>
                <dd>{profile.phoneNumber || 'Chua cap nhat'}</dd>
              </div>
              <div>
                <dt>Vai tro</dt>
                <dd>{profile.roleName}</dd>
              </div>
            </dl>
          </>
        )}
      </div>
    </section>
  );
}
