import scrapy

class DmozSpider(scrapy.Spider):
    name = "dmoz"
    allowed_domains = ["dmoz.org"]
    start_urls = [
        "http://www.8a.nu/Scorecard/Search.aspx?HideSearchForm=1&Mode=SIMPLE&CragCountryCode=USA&AscentType=0&CragName=Red+River+Gorge"
    ]

    def parse(self, response):
        hxs = HtmlXPathSelector(response)
        sites = hxs.select('//div[@class="MainText"]')
        items = []
           for site in sites:
               siteAddress = urlparse.urljoin(response.url, site.extract())
        self.log('Found category url: %s' % siteAddress)
        """
        filename = response.url.split("/")[-2]
        with open(filename, 'wb') as f:
            for sel in response.xpath('//ul/li'):
                        title = sel.xpath('a/text()').extract()
                        link = sel.xpath('a/@href').extract()
                        desc = sel.xpath('text()').extract()
                        print title, link, desc
            f.write(response.body)
        """
