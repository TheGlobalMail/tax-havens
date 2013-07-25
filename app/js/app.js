(function($, _, data) {
  'use strict';

  var companyNames = [];
  var countries;
  var highestCountryCount = 0;
  var container;
  var companyList;
  var countryList;
  var companyName;
  var defaultCompanyName;
  var scaleMarkerHigh;

  var processData = function() {
    var countryTotals = {};
    _.each(data, function(obj, companyName) {
      companyNames.push(companyName);
      _.each(obj, function(number, country) {
        if (countryTotals[country] === undefined) {
          countryTotals[country] = number;
        } else {
          countryTotals[country] += number;
        }
      });
    });
    companyNames = companyNames.sort();

    countries = _.map(countryTotals, function(total, country) {
      if (highestCountryCount < total) {
        highestCountryCount = total;
      }
      return {
        name: country,
        total: total,
        // Element bindings which are added in `insertCountries`
        container: null,
        text: null,
        bar: null,
        number: null
      };
    });
  };

  var insertCompanies = function() {
    var template = $('<li class="company">');

    _.each(companyNames, function(company) {
      var element = template.clone()
        .attr('data-company', company)
        .text(company);
      companyList.append(element);
    });
  };

  var insertCountries = function() {
    _.each(countries, function(obj) {
      var country = obj.name;

      obj.container = $('<li class="country-container" data-country-name="' + country +  '">');
      obj.text = $('<span class="country">').text(country);
      obj.bar = $('<div class="country-bar" style="width: 0;">');
      obj.number = $('<span class="country-number">').text(obj.total);

      obj.container.append(obj.text, obj.bar, obj.number);

      countryList.append(obj.container);
    });
    countryList.isotope({
      layoutMode: 'straightDown',
      itemSelector: '.country-container'
    });
    showAllCountries();
    sortCountries();
  };

  var sortCountries = function() {
    countryList.isotope('updateSortData', countryList.find('.country-container'));
    countryList.isotope({
      getSortData: {
        total: function(element) {
          return parseInt(element.attr('data-total'));
        }
      },
      sortBy: 'total',
      sortAscending: false
    });
  };

  var animateScaleMarkerHighTo = function(number) {
    scaleMarkerHigh.countTo({
      from: parseInt(scaleMarkerHigh.text()),
      to: number,
      speed: 750,
      refreshInterval: 50
    });
  };

  var filterCountriesByCompanyData = function(data) {
    var totalNumber = _.max(_.values(data));
    animateScaleMarkerHighTo(totalNumber);
    var countryNames = _.keys(data);
    var countryElements = countryList.children('.country-container');
    countryElements.each(function() {
      var element = $(this);
      var countryName = element.attr('data-country-name');
      var countryBar = element.find('.country-bar');
      var countryNumber = element.find('.country-number');
      if (data[countryName] !== undefined) {
        var total = data[countryName];
        element.attr('data-total', total);
        countryBar.css('width', ((total / totalNumber) * 100) + '%');
        countryNumber.text(total);
      } else if (!_.contains(countryNames, countryName)) {
        element.attr('data-total', 0);
        countryBar.css('width', '0');
        countryNumber.text('');
      }
    });
    requestAnimationFrame(sortCountries);
  };

  var showAllCountries = function() {
    animateScaleMarkerHighTo(highestCountryCount);
    _.each(countries, function(obj) {
      obj.container.attr('data-total', obj.total);
      var barWidth = (obj.total / highestCountryCount) * 100;
      requestAnimationFrame(function() {
        obj.bar.css('width', barWidth + '%');
        obj.number.text(obj.total);
      });
    });
    _.defer(sortCountries);
  };

  var companyOnClick = function() {
    var element = $(this);
    var companies = $('.company');
    companies.filter('.selected').removeClass('selected');
    element.addClass('selected');
    var company = element.attr('data-company');
    if (company) {
      companyName.text(company);
      filterCountriesByCompanyData(
        data[company]
      );
    } else {
      companyName.text(defaultCompanyName);
      showAllCountries();
    }
  };

  var setBindings = function() {
    $('.company').on('click', companyOnClick);
  };

  var init = function() {
    container = $('.tax-haven-visualisation');
    companyList = $('.company-list');
    countryList = $('.country-list');
    companyName = $('.company-name');
    scaleMarkerHigh = $('.scale-marker-high');
    defaultCompanyName = companyName.text();

    processData();
    insertCompanies();
    insertCountries();
    setBindings();
  };

  $(init);

}(jQuery, _, tgm.data));