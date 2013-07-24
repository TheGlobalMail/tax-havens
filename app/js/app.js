(function($, _, data) {
  'use strict';

  var companyNames = [];
  var countries;
  var highestCountryCount = 0;
  var container;
  var companyList;
  var countryList;

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
        container: null,
        bar: null
      };
    });
  };

  var insertCompanies = function() {
    var template = $('<li class="company">');

    companyList.append(
      template.clone()
        .addClass('all selected')
        .text('Total offshore subsidaries')
    );

    _.each(companyNames, function(company) {
      var element = template.clone()
        .text(company);
      companyList.append(element);
    });
  };

  var insertCountries = function() {
    _.each(countries, function(obj) {
      var country = obj.name;
      var total = obj.total;

      var container = $('<li class="country-container" data-total="' + total +  '" data-country-name="' + country +  '">');
      obj.container = container;

      var text = $('<span class="country">').text(country);

      var bar = $('<div class="country-bar" style="width: 0;">');
      obj.bar = bar;

      container
        .append(text)
        .append(bar);

      countryList.append(container);

      var barWidth = (total / highestCountryCount) * 100;
      requestAnimationFrame(function() {
        bar.css('width', barWidth + '%');
      });
    });
    requestAnimationFrame(initIsotype);
  };

  var initIsotype = function() {
    countryList.isotope({
      layoutMode: 'straightDown',
      itemSelector: '.country-container',
      getSortData: {
        total: function(element) {
          return parseInt(element.attr('data-total'));
        }
      },
      sortBy: 'total',
      sortAscending: false
    });
  };

  var sortCountries = function() {
    countryList.isotope('updateSortData', countryList.find('.country-container'));
    countryList.isotope({
      sortBy: 'total'
    });
  };

  var resetCountryBar = function(element) {
    var barWidth = (total / highestCountryCount) * 100;
    requestAnimationFrame(function() {
      bar.css('width', barWidth + '%');
      requestAnimationFrame(initIsotype)
    });
  };

  var filterCountriesByCompanyData = function(data) {
    var countryNames = _.keys(data);
    var countryElements = countryList.children('.country-container');
    countryElements.each(function() {
      var element = $(this);
      var countryName = element.attr('data-country-name');
      var countryBar = element.find('.country-bar');
      if (data[countryName] !== undefined) {
        var total = data[countryName];
        element.attr('data-total', total);
        countryBar.css('width', ((total / highestCountryCount) * 100) + '%');
      } else if (!_.contains(countryNames, countryName)) {
        element.attr('data-total', 0);
        countryBar.css('width', '0');
      }
    });
    requestAnimationFrame(sortCountries);
  };

  var companyOnClick = function() {
    var element = $(this);
    filterCountriesByCompanyData(
      data[element.text()]
    )
  };

  var setBindings = function() {
    companyList.on('click', '.company', companyOnClick);
  };

  var init = function() {
    container = $('.tax-haven-visualisation');
    companyList = $('.company-list');
    countryList = $('.country-list');

    processData();
    insertCompanies();
    insertCountries();
    setBindings();
  };

  $(init);

}(jQuery, _, tgm.data));