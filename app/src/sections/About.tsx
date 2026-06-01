export function About() {
  return (
    <section className="about-section" aria-labelledby="about-title">
      <div className="section-shell about-shell">
        <div className="about-copy">
          <p className="eyebrow">Pera Garden deneyimi</p>
          <h2 id="about-title">Şehrin ritminden uzak, davetinize yakın</h2>
          <p>
            Pera Garden; açık hava ferahlığını, özenli servis akışını ve sade bir zarafeti
            aynı bahçede buluşturur. Nikâh, yemek ve kutlama anları için planlanan alan,
            misafirlerinizin rahatça hareket edebileceği sıcak bir atmosfer sunar.
          </p>
        </div>

        <div className="about-highlights" aria-label="Pera Garden özellikleri">
          <div>
            <strong>Bahçe atmosferi</strong>
            <span>Doğal ışık, yeşil doku ve fotoğraf dostu açık alanlar.</span>
          </div>
          <div>
            <strong>Akıcı organizasyon</strong>
            <span>Karşılama, tören, yemek ve kutlama akışı tek planda düşünülür.</span>
          </div>
          <div>
            <strong>Samimi ölçek</strong>
            <span>Gösterişli ama yorucu olmayan, davetlilerinize yakın hissettiren bir düzen.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
