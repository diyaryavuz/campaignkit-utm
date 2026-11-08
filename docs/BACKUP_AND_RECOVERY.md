# Backups and recovery / Yedekleme ve kurtarma

[English README](../README.md) · [Türkçe README](../README.tr.md)

## English

Links and naming templates live in separate collections in this browser and origin. Local development and the public demo do not share storage. Make **both backups** before clearing browser data or moving devices.

### Move links

1. Open **Campaign library → JSON backup**. This exports every saved link, even with an active search.
2. In the destination browser, choose **Import** and select the link JSON file, not a template backup.
3. Imports add records without replacing the library. Duplicate generated links are skipped, including equivalent query-key orderings. Different page fragments remain distinct.
4. Check the imported count. A malformed record, invalid destination, file over 5 MB or more than 500 records rejects the import without changing the library.

The normal **CSV** button exports all links. With a search active, **Export results CSV (N)** exports only matches. CSV is for spreadsheets, not restoration; restoration requires version-1 JSON. Formula-like CSV fields receive a leading apostrophe for spreadsheet safety.

### Move templates

1. In **Link builder**, choose **Back up templates**. The separate JSON file contains names and five exact UTM values, excluding destination URLs.
2. In the destination browser, choose **Import templates**. The maximum is 20 templates and a 100 KB import file.
3. Identical templates with the same case-insensitive name are skipped. A matching name with different values rejects the entire import. Rename the conflicting template in a copy of the backup, or remove the existing template after backing up, then retry.
4. Importing does not apply values to the current campaign. Select a template and choose **Apply template** explicitly.

### Recover storage

- For unreadable data, use **Download original data** or **Download template data** before resetting. Keep the recovery text unchanged. It may need manual repair and is not guaranteed to be importable JSON.
- Reset affects only the named collection and requires confirmation. Failed writes preserve the current collection.
- If another tab changes the link library, a stale tab blocks writes. Export that tab's in-memory JSON backup, reload, then import it if needed. This guard checks before writes; it is not real-time synchronization or an atomic multi-tab database.
- If storage is blocked or full, check browser permissions and free space. Export readable data before resetting. Language selection still works for the session when its preference cannot be saved.

### Validation details

Destination control characters are rejected rather than silently removed. Unrelated parameters and fragments remain intact. Uppercase naming warnings cover Unicode alphabets. Explicit normalization handles decomposed Turkish characters; typing, importing and saving do not silently normalize values. Imported timestamps require a real calendar date, complete time and timezone. Invalid timestamps receive a fresh import time.

## Türkçe

Bağlantılar ve şablonlar bu tarayıcıda, ayrı koleksiyonlarda saklanır. Yerel geliştirme ile canlı demo veri paylaşmaz. Tarayıcı verilerini temizlemeden veya cihaz değiştirmeden önce **iki ayrı yedek** alın.

### Bağlantıları taşıma

1. **Kampanya kütüphanesi → JSON yedeği** tüm bağlantıları indirir; açık arama bunu daraltmaz.
2. Hedef tarayıcıda **İçe aktar** ile bağlantı yedeğini seçin. Şablon yedeği bu alanda kullanılamaz.
3. İçe aktarma mevcut kayıtları değiştirmeden ekleme yapar. Sorgu anahtarlarının sırası farklı olsa da aynı bağlantılar atlanır. Farklı sayfa işaretleri ayrı tutulur.
4. Hatalı kayıt/adres, 5 MB üzeri dosya veya 500 kayıt sınırının aşılması işlemi reddeder; mevcut kütüphane korunur.

**CSV** tüm kütüphaneyi, **Sonuçları CSV indir (N)** yalnızca arama eşleşmelerini indirir. CSV geri yükleme yedeği değildir; bunun için sürüm-1 JSON kullanın. Formül gibi başlayabilecek CSV alanlarına koruyucu tek tırnak eklenir.

### Şablonları taşıma

1. **Bağlantı oluşturucu → Şablonları yedekle** ile ayrı JSON dosyasını indirin. Şablon adları ve beş UTM alanı bulunur; hedef adresler yer almaz.
2. Hedef tarayıcıda **Şablonları içe aktar** düğmesini kullanın. En fazla 20 şablon ve 100 KB dosya kabul edilir.
3. Büyük/küçük harf ayrımı olmadan aynı ada ve aynı değerlere sahip şablonlar atlanır. Aynı adda farklı değerler varsa tüm işlem reddedilir. Yedeğin bir kopyasında çakışan adı değiştirin veya mevcut şablonu yedekledikten sonra silip yeniden deneyin.
4. İçe aktarma formu değiştirmez. Kullanmak için şablonu seçip **Şablonu uygula** düğmesine basın.

### Depolama sorunlarını giderme

- Önce **Orijinal veriyi indir** veya **Şablon verisini indir** düğmesini kullanın. Kurtarma metninin aslını saklayın; dosya elle onarım gerektirebilir ve doğrudan içe aktarılabileceği garanti edilmez.
- Sıfırlama yalnızca adı belirtilen koleksiyonu etkiler ve onay ister. Başarısız kayıt mevcut koleksiyonu değiştirmez.
- Başka sekme kütüphaneyi değiştirirse eski sekmede yazma engellenir. O sekmenin JSON yedeğini alın, sayfayı yenileyin ve gerekirse yedeği içe aktarın. Bu kontrol anlık senkronizasyon veya atomik veritabanı güvencesi sağlamaz.
- Tarayıcı izinlerini ve boş alanı kontrol edin. Sıfırlamadan önce okunabilen veriyi dışa aktarın. Dil tercihi kaydedilemese de o oturumda dil değiştirilebilir.

Adreslerdeki görünmez kontrol karakterleri reddedilir; ilgisiz parametreler ve sayfa işaretleri korunur. Büyük harf uyarıları farklı alfabeleri kapsar. Açıkça seçilen normalleştirme ayrık Unicode Türkçe karakterlerini de işler. Kampanya değerleri sessizce normalleştirilmez. Geçersiz yedek tarihleri içe aktarma zamanı ile değiştirilir; geçerli tarih tam saat ve zaman dilimi içermelidir.

## Verification evidence

47 automated tests and a production build passed. An isolated local Chromium session checked template JSON download/import, search-only CSV contents, invalid-field focus, row error descriptions and language persistence after reload. Both languages were checked at 375 px with no horizontal document overflow or page errors. These checks are not a full accessibility audit or all-browser compatibility test.

[Turkish mobile screenshot](maintenance-tr-mobile.png) · [English mobile screenshot](maintenance-en-mobile.png)
