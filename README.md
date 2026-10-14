# Ahenk Kafe · Menü ve Sadakat Yönetimi

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

Ahenk Kafe için hazırlanmış tanıtım ve dijital menü sitesi. Firebase Cloud Firestore ile menü ve müşteri damga/puan kayıtlarını yöneten ayrı bir yönetim ekranı içerir.

## Özellikler

- Kafe tanıtımı, ürün menüsü ve iletişim bölümleri.
- Firestore üzerinden dinamik menü.
- Yönetim ekranında müşteri kartları ve damga/ödül takibi.
- Menü ekleme, düzenleme, aktiflik yönetimi ve içe aktarma yardımcısı.

## Yerel önizleme

Build adımı veya npm bağımlılığı yoktur. Python 3 ile proje klasöründen:

```sh
git clone https://github.com/Erkan54/AhenkWeb.git
cd AhenkWeb
python -m http.server 8000
```

Tarayıcıda `http://localhost:8000` adresini açın. Bu komut yalnızca statik dosyaları sunar; veritabanı veya özel backend başlatmaz.

## Dosya haritası

| Dosya / klasör | İşlev |
| --- | --- |
| `index.html` | Tanıtım sitesi ve menü |
| `admin.html` | Menü/müşteri yönetimi |
| `js/main.js` | Ana sayfa etkileşimleri |
| `js/admin.js` | Firestore müşteri ve menü işlemleri |
| `import_menu.html` | Başlangıç menüsünü içe aktarma aracı |
| `css/ / images/` | Stil ve görseller |
| `vercel.json` | Barındırma yapılandırması |

## Yapılandırma ve yayın

Firebase ayarları HTML/JavaScript içinde yer alır. Kendi Firestore projeniz için `menu` ve `customers` koleksiyonları ile okuma/yazma kurallarını yapılandırın. `import_menu.html` kayıt yazan kurulum aracıdır. Yönetici ekranındaki istemci taraflı giriş kontrolü, veritabanı yetkilendirmesinin yerine geçmez. Bu repo QR sipariş sisteminden ayrıdır; tam masa sipariş backend'i içermez.

Dosyalar statik barındırmaya uygundur. Yayından önce mobil menü, göreli dosya yolları, iletişim bağlantıları ve kullanılan dış kaynakları tarayıcıda kontrol edin. Otomatik uygulama test paketi bu depoda tanımlı değildir.
