(function($, _, data) {
  'use strict';

  var companyNames = [];
  var allCountries;
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

    allCountries = _(countryTotals).map(function(total, country) {
      if (highestCountryCount < total) {
        highestCountryCount = total;
      }
      return {
        name: country,
        total: total,
        container: null,
        bar: null
      };
    }).sortBy(function(obj) {
      return obj.total;
    }).reverse().value();
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
    _.each(allCountries, function(obj) {
      var country = obj.name;
      var total = obj.total;
      var container = $('<li class="country-container">');
      obj.container = container;
      var text = $('<span class="country">').text(country);
      var bar = $('<div class="country-bar">');
      obj.bar = bar;
      bar.css('width', 0);

      container
        .append(text)
        .append(bar);

      countryList.append(container);
      var barWidth = total * (container.width() / highestCountryCount);
      requestAnimationFrame(function() {
        bar.css('width', barWidth);
      });
    });
  };

  var filterCountriesByCompanyData = function(data) {
    // change width of each country to either it's fractional width or 0
    // reposition each country in order,
    //   where order is a descending arrangement reflecting the country's total or
    //   alphabetic arrangement if the total is 0
    var countries = _.keys(data);
    _.each(allCountries, function(obj) {
      if (_.contains(countries, obj.text)) {
        // update with new val
        // reposition
        obj.bar.css('width', barWidth);
      } else {
        // set width to 0
        // reposition
      }
    })
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