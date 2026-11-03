# CampaignKit

**Kampanya bağlantılarını tutarlı hazırlamak için yerel çalışan bir araç.**

[English](README.md) · [Canlı demo](https://diyaryavuz.github.io/campaignkit-utm/) · [Test ve yayın durumu](https://github.com/diyaryavuz/campaignkit-utm/actions)

![CampaignKit ekranı](docs/screenshot.png)

## Hangi sorunu çözüyor?

Bir kampanyanın Instagram hikâyesi, gönderisi ve e-posta bülteni için bağlantı hazırlarken isimlendirme kolayca dağılabiliyor. CampaignKit, aynı kampanyanın varyantlarını birlikte hazırlamayı ve UTM değerlerini tutarlı tutmayı kolaylaştırır. Diyar Yavuz'un dijital pazarlama ve web tasarımı deneyimini birleştiren kişisel portföy projesidir. Müşteri ürünü veya ölçülmüş başarı hikâyesi olduğu iddia edilmez.

## Yapabildikleri

- Canlı önizlemeyle UTM bağlantısı oluşturma; mevcut sorgu alanlarını ve `#` işaretlerini koruma.
- Eksik alan, geçersiz adres, adres içinde kullanıcı adı/şifre, büyük harf ve boşluk kontrolü.
- Var olan desteklenen UTM alanları değiştirileceğinde ve otomatik reklam kimliği bulunduğunda uyarı.
- Tek kampanya için 50'ye kadar kanal/içerik varyantı.
- Yerel kütüphanede 500'e kadar bağlantı; arama ve yeniden kullanma.
- Aynı üretilen bağlantıyı tekrar kaydetmeme.
- JSON yedeği ve birleştirerek içe aktarma; CSV dışa aktarma.
- Bozuk yedekte tüm içe aktarmayı reddetme; bozuk yerel veriyi sessizce sıfırlamama.
- Türkçe/İngilizce arayüz, mobil düzen, klavye etiketleri.

## Adlandırma örnekleri

Tutarlı `source` / `medium` / `campaign` değerleri için [İngilizce-Türkçe örnekler](docs/NAMING_EXAMPLES.md).

## Çalıştırma

Node.js **22.12+** ve npm kullanın.

```sh
git clone https://github.com/diyaryavuz/campaignkit-utm.git
cd campaignkit-utm
npm ci
npm run dev
```

```sh
npm test       # 19 test: URL, veri koruma, içe aktarma ve arayüz akışları
npm run build # TypeScript kontrolü ve üretim derlemesi
npm run preview
```

## Gerçek sınırlar

Bu uygulama tıklama, dönüşüm, satış veya ROAS ölçmez. Meta/Google Ads hesaplarına bağlanmaz; API anahtarı veya giriş gerektirmez. UTM alanları tek başına ölçüm sistemi değildir: hedef sitenizde uygun analiz kurulumu gerekir. Otomatik etiketleme ile elle UTM kullanımının etkisini kendi analiz kurulumunuzda kontrol edin.

Veriler sunucuya gönderilmez; hedef URL'ye istek yapılmaz. Kayıtlar aynı origin'deki `localStorage` alanında tutulur. Tarayıcı verileri temizlendiğinde kaybolabilir; önemli kayıtları JSON olarak yedekleyin. İlk demo örnekleri yalnızca `example.com` adresini kullanır. Bağlantılara kişisel bilgi veya gizli anahtar koymayın. Harici GitHub/rehber bağlantılarına tıklarsanız ilgili siteye gidersiniz.

İsimler otomatik değiştirilmez. Normalleştirme düğmesi Türkçe karakterleri Latin karşılıklarına dönüştürür, küçük harf ve alt çizgi uygular; tercihinize bağlıdır. Kaydetmek mevcut hedefteki desteklenen `utm_*` alanlarını değiştirir; diğer parametreler korunur. CSV'deki formül gibi başlayabilecek alanlar elektronik tablo güvenliği için tek tırnakla başlatılır.

GitHub Pages yayınında testlerin ve derlemenin başarılı olması gerekir. Kaynak koduna yapılan her `main` push'u demoyu yeniden yayımlar. Yerel önizleme ve canlı demo farklı origin olduğu için kayıtlarını paylaşmaz.

## İsimlendirme şablonları

Tek bağlantı oluşturucuda en az bir UTM alanı ve benzersiz bir şablon adı girip **Şablonu kaydet** düğmesini kullanın. Kayıtlı bir şablonu seçmek formu değiştirmez; **Şablonu uygula** beş UTM alanını boş değerler dahil değiştirir, hedef adresi korur. Değerler olduğu gibi saklanır; normalleştirme yalnızca açıkça istediğinizde yapılır.

En fazla 20 şablon bu tarayıcıda saklanır. Şablon adları en fazla 60, UTM alanları 200 karakterdir. Silme onay ister; başarısız kayıtlar mevcut şablonları değiştirmez. Okunamayan veri korunur, indirilebilir ve açık onayla sıfırlanabilir. Şablonlar bağlantı kütüphanesinden ayrıdır; **kütüphanenin JSON yedeğine dahil değildir**. Tarayıcı verilerini temizlemek şablonları silebilir.

## Lisans

CampaignKit kaynak kodu [MIT Lisansı](LICENSE) ile açık kaynaklıdır. Üçüncü taraf bağımlılıklar kendi lisanslarını korur.

## Kaynaklar

- [Google Analytics UTM rehberi](https://support.google.com/analytics/answer/10917952)
- [MDN URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [GitHub Pages iş akışları](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## Topluluğa katılın

Yeni katkıcılar için [beş dakikalık rehber](docs/QUICK_START.md), [katkı kılavuzu](CONTRIBUTING.md) ve [başlangıç görevleri](docs/STARTER_TASKS.md) hazır. Kod, belge, çeviri, erişilebilirlik geri bildirimi ve test katkıları kabul edilir. Bir göreve başlamadan önce ilgili GitHub issue yorumlarını okuyup tek görev için yorum bırakın. Ortak çalışma dili İngilizcedir; Türkçe sorular da kabul edilir.

İlk sürüm kapsamı v0.1.0 yerel UTM araç kutusudur; Android dalı bu çalışmanın kapsamında değildir. [Yol haritası](docs/ROADMAP.md), [sürüm notları](CHANGELOG.md), [topluluk kuralları](CODE_OF_CONDUCT.md) ve [güvenlik/veri güvenliği](SECURITY.md) belgelerine bakın. Sürüm notlarının hazırlanması, GitHub Release'in yayımlandığı anlamına gelmez.
