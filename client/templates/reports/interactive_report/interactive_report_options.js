import {setupSequenceParameters, setupSubjectParameters} from "../../../helpers/parameters";
import {getSequences} from "../../../helpers/sequences";
import {getStudent, getStudents} from "../../../helpers/students";


// import {getSequence, getSequences} from "../../../helpers/sequences";
// import {getStudent, getStudents} from "../../../helpers/students";
// import {setupSubjectParameters, setupSequenceParameters} from "../../../helpers/parameters";




Template.interactiveReportOptions.rendered = function() {
    // show different report options
    // 'environments':
}

const envSet = new ReactiveVar(false);
const obsOptions = new ReactiveVar([]);
const selectedEnvironment = new ReactiveVar(false);
const selectedObservations = new ReactiveVar([]);
const selectedXParameter = new ReactiveVar(false);
const selectedYParameter = new ReactiveVar(false);
const graphType = new ReactiveVar('equity');

const possibleSlides = {
  env: {
    show: 'env',
    pos: 1,
  },
  obs: {
    show: 'obs',
    pos: 2,
  },
  params: {
    show: 'params',
    pos: 3,
  },
  graph: {
    show: 'params',
    pos: 3,
  },
};

const lastSlide = new ReactiveVar('env');


let calculateSlidePosition = function(section) {
  console.log('calculateSlidePosition, going to slide', section);
  lastSlide.set(section);
  let slideSettings = possibleSlides[lastSlide.get()];
  let prevSlides = Object.keys(possibleSlides).filter(item => possibleSlides[item].pos < slideSettings.pos);
  console.log('prevsliders', prevSlides);

  let heights = prevSlides.map(prevSlide => $('.report-section[data-slide-id="' + prevSlide +'"]').height() + 40); // 40px margin
  let aboveItemsHeight = heights.reduce((a, b) => a + b, 0);  // sum
  let topMargin = `${aboveItemsHeight * -1}px`;

  $('.report-section-wrapper__slide').css('marginTop', topMargin)
}



Template.interactiveReportOptions.helpers({
    environments: function() {
        return Environments.find();
    },
    environmentChosen: function() {
        return !!(selectedEnvironment.get());
    },
    // observationsExist: function() {
    //     console.log('checked if observations exist');
    //     return obsOptions.get().length !== 0
    // },
    observations: function() {
        // console.log('obsOptions', obsOptions);
        return obsOptions.get()
    },
    possibleSlides: function() {
        // console.log('obsOptions', obsOptions);
        return possibleSlides;
    },
    lastSlide: function() {
        // console.log('obsOptions', obsOptions);
        return lastSlide.get()
    },
    observationChosen: function() {
        // console.log('observationChosen', obsOptions.get(), !!(obsOptions.get()));

        return !!(selectedObservations.get().length)
    }
});

var clearObservations = function() {
  clearParameters();
  selectedObservations.set([]);
  $('.option--observation').removeClass('selected');

};


var clearParameters = function() {
  selectedXParameter.set(false);
  selectedYParameter.set(false);
  $('.option--discourse').removeClass('selected');
  $('.option--demographic').removeClass('selected');
  $('.swappable').removeClass('swapped')
};

Template.interactiveReportOptions.events({
  'click .report-section-wrapper__fade': function(e) {
    lastSlide.get();
    let lastSlidePos = possibleSlides[lastSlide.get()].pos;

    console.log('lastslidepos', lastSlidePos);

    let prevSlide = Object.keys(possibleSlides).filter(item => possibleSlides[item].pos === lastSlidePos - 1);

    console.log('prev slide', prevSlide);

    if (typeof prevSlide[0] === 'undefined') {
      return
    }

    calculateSlidePosition(possibleSlides[prevSlide[0]].show);
  },
    'click .option--environment': function(e) {
      let $target = $(e.target);
        if (!$target.hasClass('selected')) {
            $('.option--environment').removeClass('selected');
            $target.addClass('selected');
        }
        else {
          return;
        }
      calculateSlidePosition('obs');

      clearObservations();
        envSet.set(false);
        envSet.set(true);
        selectedEnvironment.set(getCurrentEnvId());
        obsOptions.set([]);
        obsOptions.set(getObsOptions());
        // console.log('obs options get', obsOptions.get());
        envSet.set(!!getCurrentEnvId());

    },
    'click .option--observation': function(e) {
      calculateSlidePosition('obs');
      // clearParameters();
      let $target = $(e.target);
      if (!$target.hasClass('selected')) {
        // $('.option--observation').removeClass('selected');
        $target.addClass('selected');
      }
      else {
        $target.removeClass('selected');
      }

      let clickedObservationId = $(e.target).attr('data-obs-id');

      let currentObsIds = selectedObservations.get();

      if (currentObsIds.find(id => id === clickedObservationId)) {
        currentObsIds.splice(currentObsIds.indexOf(clickedObservationId), 1);
      }
      else {
        currentObsIds.push(clickedObservationId);
      }

      selectedObservations.set(currentObsIds);
      $(window).trigger('updated-filters') // We're also forcing a graph update when you select new observations, not just changing params
    },
    'click .graph-type-toggle-wrapper': function(e) {
      let $target = $(e.target);

      if (!$target.hasClass('graph-type-toggle-wrapper')) {
        $target = $target.parents('.graph-type-toggle-wrapper')
      }
      $target = $('.toggle--graph-type', $target)

      if ($target.attr('data-graph-type') === 'equity') {
        $target.attr('data-graph-type', 'contributions')
        graphType.set('contributions');
        $target.text('Contributions');
      }
      else {
        $target.attr('data-graph-type', 'equity');
        graphType.set('equity');
        $target.text('Equity Ratio');
      }

      $('.interactive-report__graph').attr('data-graph-type', graphType.get());
      $(window).trigger('updated-filters') // We're also forcing a graph update when you select new observations, not just changing params
    },
  // 'click .option--demographic': function(e) {
  //   let $target = $(e.target);
  //   if (!$target.hasClass('selected')) {
  //     $('.option--demographic').removeClass('selected');
  //     $target.addClass('selected');
  //   }
  //
  //   selectedXParameter.set(getXAxisSelection());
  //   selectedYParameter.set(getYAxisSelection());
  //   $(window).trigger('updated-filters')
  // },
  // 'click .option--discourse': function(e) {
  //   let $target = $(e.target);
  //   if (!$target.hasClass('selected')) {
  //     $('.option--discourse').removeClass('selected');
  //     $target.addClass('selected');
  //   }
  //
  //   selectedXParameter.set(getXAxisSelection());
  //   selectedYParameter.set(getYAxisSelection());
  //   $(window).trigger('updated-filters')
  // },
  // 'click .swappable__button': function(e) {
  //   console.log('click');
  //   let $target = $(e.target);
  //   $target.parents('.swappable').toggleClass('swapped');
  //
  //   $(window).trigger('updated-filters');
  // },
});



Template.interactiveReportView.rendered = function() {
  // show different report options
}

Template.interactiveReportView.events({
  'click .option--demographic': function(e) {
    calculateSlidePosition('params');

    let $target = $(e.target);
    if (!$target.hasClass('selected')) {
      $('.option--demographic').removeClass('selected');
      $target.addClass('selected');
    }

    selectedXParameter.set(getXAxisSelection());
    selectedYParameter.set(getYAxisSelection());
    $(window).trigger('updated-filters')
  },
  'click .option--discourse': function(e) {
    calculateSlidePosition('params');
    let $target = $(e.target);
    if (!$target.hasClass('selected')) {
      $('.option--discourse').removeClass('selected');
      $target.addClass('selected');
    }

    selectedXParameter.set(getXAxisSelection());
    selectedYParameter.set(getYAxisSelection());
    $(window).trigger('updated-filters')
  },
  'click .swappable__button': function(e) {
    calculateSlidePosition('params');
    let $target = $(e.target);
    $target.parents('.swappable').toggleClass('swapped')

    selectedXParameter.set(getXAxisSelection());
    selectedYParameter.set(getYAxisSelection());
    $(window).trigger('updated-filters');
  },
})



let getObsOptions = function() {
    let envId = getCurrentEnvId();
    if (!!envId) {
        let obs = Observations.find({envId: envId}).fetch();
        return obs;
    }
    else {
        return false;
    }
}

let getCurrentEnvId = function() {
    let selected = $(".option--environment.selected");
    if (selected.length !== 0) {
        return selected.attr('data-env-id');
    }
    else {
        return false
    }
}


let getDemographics = function() {
  let envId = selectedEnvironment.get();
  return setupSubjectParameters(envId);
};

let getDiscourseDimensions = function() {
  let envId = selectedEnvironment.get();
  return setupSequenceParameters(envId);
};

let getEnvironment = function() {
  let envId = selectedEnvironment.get();
  return Environments.findOne({_id: envId})
}

let getObservations = function() {
  let obsIds = selectedObservations.get();
  return Observations.find({_id: {$in: obsIds}}).fetch();
}


Template.interactiveReportView.helpers({
  discourseDimensions: function() {
    return getDiscourseDimensions()
  },
  demographics: function() {
    return getDemographics()
  },
  environment: function() {
    return getEnvironment();
  },
  observations: function() {
    return getObservations();
  },
  observationNames: function() {
    let observations = getObservations();
    let obsNames = observations.map(obs => obs.name);

    if (obsNames.length >= 3) {
      return obsNames.slice(0,-1).join(', ') + ', and ' + obsNames[obsNames.length - 1]
    }
    else if (obsNames.length === 2) {
      return obsNames.join(' and ');
    }
    else {
      return obsNames[0]
    }
  }
});

var d3 = require('d3');

let getCurrentDiscourseSelection = function() {
  let selected = $(".option--discourse.selected");
  if (selected.length !== 0) {
    return selected.attr('data-discourse-id');
  }
  else {
    return false
  }
}

let getCurrentDemographicSelection = function() {
  let selected = $(".option--demographic.selected");
  if (selected.length !== 0) {
    return selected.attr('data-demo-id');
  }
  else {
    return false
  }
};

let getXAxisSelection = function() {
  return getAxisSelection('X');
};

let getYAxisSelection = function() {
  return getAxisSelection('Y');
};

let xor = function(a, b) {
  return (a || b) && !(a && b);
};

let getAxisSelection = function(axis) {
  let $swappable = $('.swappable');
  let param_wrapper;

  let swapped = $swappable.hasClass('swapped');
  let isXAxis = (axis === 'x' || axis === 'X');
  // Could totally refactor this to a ternary expression, but those are kinda hard to read/maintain.
  if (xor(swapped, isXAxis)) {
    param_wrapper = $swappable.find('.param-select:first-child');
  }
  else {
    param_wrapper = $swappable.find('.param-select:last-child');
  }
  let selected = $('.report-select__option.selected', param_wrapper);

  if (selected.length === 0) {
    return {};
  }

  let selected_value = selected.attr('data-id');
  let param_type = selected.attr('data-param-type');
  let options = getParamOptions(param_type);
  let selected_option = options.filter(opt => opt.name === selected_value)[0];
  selected_option.option_list = selected_option.options.split(',').map(function(i) {return i.trim()})

  let ret = {
    selected_value: selected_value,
    selected_option: selected_option,
    param_type: param_type,
    options: options,
    // selected_value_options: getParamOptions(self.param_type).filter(opt => opt.name === selected.attr('data-id'))
    // [0].split(',').map(function(i) {return i.trim()})
  }
  // console.log('ret in y axis', ret);
  return ret
}


let getParamOptions = function(param_type) {
  if (param_type === "discourse") {
    return getDiscourseDimensions()
  }
  else {
    return getDemographics()
  }
};

let allParamsSelected = function () {
  let demo_select = getCurrentDemographicSelection();
  let disc_select = getCurrentDiscourseSelection();
  return (!!demo_select && !!disc_select)
};


$(window).on('updated-filters', function() {
  if (allParamsSelected()) {
    updateReport()
  }
});

let sidebar;
let updateReport = function() {

  let report_wrapper = $('.report-section--interactive-report')
  report_wrapper.removeClass('inactive');
  if ($('.interactive-report', report_wrapper).length === 0) {
    createReport()
    let sidebarLevels = {
      0: 'key',
      1: 'bar_tooltip',
    }
    sidebar = new Sidebar('.interactive-report__key-sidebar', sidebarLevels);
  }
  updateReportTitle()
  updateKeySidebar(); // todo, make the colors here match the actual graph
  updateGraph();



  // update the report values
}

let updateGraph = function() {
  let envId = getEnvironment()._id;
  let obsIds = getObservations().map(obs => obs._id); // todo allow passing the full obs object so we don't need to create it later
  let xParams = getXAxisSelection();
  let yParams = getYAxisSelection();

  // let graphData = getContributionData(obsIds, xParams, yParams, envId);
  // let demData = makeDemGraphs(envId, xParams, envId);
  // makeRatioGraphs(envId, graphData, demData);
  // console.log('graphData', graphData);

  let contribData = compileContributionData(obsIds, xParams, yParams, envId);

  // options are 'contributions' or 'equity'
  createGraph(contribData, '.interactive-report__graph', graphType.get())


};

let createGraph = function(contribData, containerSelector, dataset) {
  svg = $('<svg width="668" height="500"></svg>');
  $(containerSelector).html(svg);

  var svg = d3.select(containerSelector + " svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x0 = d3.scaleBand() // each group
    .rangeRound([0, width])
    .paddingInner(0.1);

  var x1 = d3.scaleBand() // inside each group
    .padding(0.10);

  var y = d3.scaleLinear()
    .rangeRound([height, 0]);

  // choose which data we're using, equity ratios or absolute contrib values:
  let y_label = '';
  if (dataset === 'contributions') {
    data = contribData.y_axis;
    y_label = "Contributions";

  } else {
    data = contribData.equity_ratio_data;
    y_label = "Equity Ratio";
  }
  // var keys = data.column_keys.slice(1);
  var keys = contribData.column_keys;

  let key_colors = getLabelColors(keys);
  var z = d3.scaleOrdinal()
    .range(Object.values(key_colors));

  x0.domain(data.map(function(d) { return d.column_name; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

  g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
    .attr("transform", function(d) { return "translate(" + x0(d.column_name) + ",0)"; })
    .attr("class", 'bar-group')
    .attr("data-bar-group", function(d) { return d.column_name })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
    .attr("x", function(d) { return x1(d.key); })
    .attr("y", function(d) { return y(d.value); })
    .attr("width", x1.bandwidth())
    .attr("height", function(d) { return height - y(d.value); })
    .attr("fill", function(d) { return z(d.key); })
    .attr("class", 'hover-bar')
    .attr("data-bar-x", function(d) { return d.key })
    .on('mouseover', function() {
      // hover on
      let group = $(this).parent().attr('data-bar-group');
      let bar = $(this).attr('data-bar-x');
      buildBarTooltipSlide(group, bar, contribData)
    })
    .on('mouseout', function() {
      // sidebar.setCurrentPanel('key')
      // hover out

    });

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x0).tickFormat(function(d, i) { return `${d} (n = ${contribData.x_axis_n_values[d].n})`}));


  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
    .attr("x", 2)
    .attr("y", y(y.ticks().pop()) + 0.5)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text(y_label);

  let toggleTickDirection = function(tick) {
    if ($(tick).attr('x2') === "-6") {
      $(tick).attr('x2', width)
    }
    else {
      $(tick).attr('x2', "-6")
    }
  };

  if (graphType.get() === 'equity') {
    let center_line = $('.axis--y g').filter((idx, item) => parseFloat($('text', item).text()) === 1.);
    toggleTickDirection($('line', center_line[0]));
    $(center_line[0]).on('click', function(tick) {
      toggleTickDirection($('line', center_line[0]));
    });
    $(center_line[0]).addClass('clickable-tick')
  }



  // We're creating the legend separately in the key/sidebar area.

  // var legend = g.append("g")
  //     .attr("font-family", "sans-serif")
  //     .attr("font-size", 10)
  //     .attr("text-anchor", "end")
  //     .selectAll("g")
  //     .data(keys.slice().reverse())
  //     .enter().append("g")
  //     .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
  //
  // legend.append("rect")
  //     .attr("x", width - 19)
  //     .attr("width", 19)
  //     .attr("height", 19)
  //     .attr("fill", z);
  //
  // legend.append("text")
  //     .attr("x", width - 24)
  //     .attr("y", 9.5)
  //     .attr("dy", "0.32em")
  //     .text(function(d) { return d; });

}


let buildBarTooltipSlide = function(group, bar, contribData) {
  console.log('building tooltip for group', group, 'bar', bar, 'with contribdata', contribData)
  let title = `${group} x ${bar}`;
  let num_contributions = contribData.x_axis_n_values[group].columns[bar];
  let total_contribs_in_group = contribData.x_axis_n_values[group].n;
  let total_contribs_of_type = contribData.y_axis_n_values[group];
  let num_students_in_group = 'tbd';
  let html = `
    <div class="stat-leadin">Of the contributions by demographic <span class="stat-group-name">${group}</span>...</div>
    <div class="stat">${num_contributions} of ${total_contribs_in_group} were <span class="stat-group-name">${bar}</span> (${(num_contributions / total_contribs_in_group * 100).toFixed(2)}%)</div>
    <div class="stat-leadin">Of the contributions of type <span class="stat-group-name">${bar}</span>...</div>
    <div class="stat">${num_contributions} of ${total_contribs_of_type} were by students in the demographic <span class="stat-group-name">${group}</span> (${(num_contributions / total_contribs_of_type * 100).toFixed(2)}%)</div>
    <div class="stat-leadin">Of all students ${num_students_in_group} are <span class="stat-group-name">${group}</span></div>
    <div class="stat-leadin">Participation:</div>
    <div class="stat">tbd</div>
  `;

  sidebar.setSlide('bar_tooltip', html, title)
}

let compileContributionData = function(obsIds, xParams, yParams, envId) {

  // let contrib_data_model = {
  //   y_axis: [
  //     {column_name: "Boy", "Yes": 4, "No": 1}, // X axis items inside each group
  //     {column_name: "Girl", "Yes": 3, "No": 3}, // X axis items inside each group
  //     {column_name: "Nonbinary", "Yes": 2, "No": 2}, // X axis items inside each group
  //     {column_name: "Other", "Yes": 3, "No": 6},
  //   ],
  //   axis_title: 'Explicit Evaluation',
  // };
  // contrib_data_model.y_axis["columns"] = [
  //   "Gender",
  //   "Yes",
  //   "No",
  // ];


  let contrib_data = {y_axis: []};

  // Add each coulumn of X

  let defaultXAxisObj = {};
  let studentContributionsXAxisObj = {};

  // Init each "group" with 0 across all values.
  for (let y_axis_item_key in yParams.selected_option.option_list) {
    if (!yParams.selected_option.option_list.hasOwnProperty(y_axis_item_key)) continue;
    let y_axis_item = yParams.selected_option.option_list[y_axis_item_key];
    defaultXAxisObj[y_axis_item] = 0;
    studentContributionsXAxisObj[y_axis_item] = {};
  }

  // Create each group with the correct title
  for (let x_axis_item_key in xParams.selected_option.option_list) {
    if (!xParams.selected_option.option_list.hasOwnProperty(x_axis_item_key)) continue;
    let x_axis_item = xParams.selected_option.option_list[x_axis_item_key];
    let x_axis_obj = JSON.parse(JSON.stringify(defaultXAxisObj)); // Clone the obj
    x_axis_obj["column_name"] = x_axis_item;
    x_axis_obj["student_contributions"] = JSON.parse(JSON.stringify(studentContributionsXAxisObj));
    // add item after extending the default x axis obj
    contrib_data.y_axis.push(x_axis_obj)
  }

  // Record contributions
  // console.log('obsIds', obsIds);

  // let observation = getObservation();
  for (let obsId_k in obsIds) {
    if (!obsIds.hasOwnProperty(obsId_k)) continue;
    let obsId = obsIds[obsId_k];

    let sequences = getSequences(obsId, envId);
    for (let sequence_k in sequences) {
      if (!sequences.hasOwnProperty(sequence_k)) continue;
      let sequence = sequences[sequence_k];
      // console.log('sequence', sequence);

      let sequence_y;
      if (yParams.param_type === 'demographics') {
        sequence_y = sequence.info.student.demographics[yParams.selected_value];
      }
      else {
        sequence_y = sequence.info.parameters[yParams.selected_value];
      }

      let sequence_x;
      if (xParams.param_type === 'demographics') {
        sequence_x = sequence.info.student.demographics[xParams.selected_value];
      }
      else {
        sequence_x = sequence.info.parameters[xParams.selected_value];
      }

      // console.log('sequence_y,',sequence_y);
      // console.log('sequence_x,',sequence_x);
      increaseValueForAxes(contrib_data.y_axis, sequence_y, sequence_x);
      increaseValueForStudent(contrib_data.y_axis, sequence_y, sequence_x, sequence.info.student);

    }
  }
  // console.log('xParams', xParams)
  // console.log('yParams', yParams)

  // let sequences = ;
  // console.log('obsIds', obsIds);


  // Set up columns
  contrib_data.column_keys = yParams.selected_option.option_list;

  // Get n values for groups
  contrib_data.x_axis_n_values = {};

  contrib_data.y_axis.forEach(function(y_item) {
    // get values of the column group
    let values = Object.keys(y_item).map(function(key) {if (key !== 'column_name') return y_item[key]}).filter(item => !isNaN(item));
    // total above values
    // console.log('values', values);
    let column_n_values = Object.assign({}, y_item);
    delete column_n_values['column_name'];
    delete column_n_values['student_contributions'];

    contrib_data.x_axis_n_values[y_item.column_name] = {
      n: values.reduce((a, b) => a + b, 0),
      columns: column_n_values
    }
  });

  // Get n values for totaled graphs (y)

  contrib_data.y_axis_n_values = {};

  contrib_data.y_axis.forEach(function(y_item) {
    // console.log('y_item', y_item);
    let y_axis_items = Object.assign({}, y_item);
    delete y_axis_items['column_name'];
    delete y_axis_items['student_contributions'];
    Object.keys(y_axis_items).forEach(function(key) {
      if (typeof contrib_data.y_axis_n_values[key] !== 'undefined') {
        contrib_data.y_axis_n_values[key] += y_axis_items[key]
      }
      else {
        contrib_data.y_axis_n_values[key] = y_axis_items[key]
      }
    })

  });

  // Calculate equity ratios. These are done by taking
  // (num_contributions_by_value/total_contributions) / (num_subjects_with_value/total_subjects)

  // num_students_by_y_value

  // to make equity ratios not count students that were missing for
  // a class or two (and were marked as such, once that's possible),
  // we'll need to update how this is calculated, perhaps by doing it
  // by observation, then calculating the equity ratio per observation.
  // all equity ratios across all observations would then need to be averaged.

  let students = getStudents(envId);
  let demographics = getDemographics();
  let currentDemo = getCurrentDemographicSelection();
  let currentDemoOptions = demographics.filter(demo => demo.name === currentDemo)[0]
    .options.split(',').map(opt => opt.trim());

  contrib_data.student_body_demographic_ratios = {}

  currentDemoOptions.forEach(function(demo) {
    contrib_data.student_body_demographic_ratios[demo] =
      students.filter(student => student.info.demographics[currentDemo] === demo).length / students.length
  });

  contrib_data.equity_ratio_data = contrib_data.y_axis.map(function(y) {

    let column_values = Object.assign({}, y);
    delete column_values['column_name'];
    delete column_values['student_contributions'];
    let equity_ratios = {}
    Object.keys(column_values).forEach(function(key) {
      let percent_of_demo = contrib_data.student_body_demographic_ratios[y.column_name];
      if (isNaN(percent_of_demo)) percent_of_demo = 0;

      let percent_of_contribs = (column_values[key] / contrib_data.y_axis_n_values[key]);
      if (isNaN(percent_of_contribs)) percent_of_contribs = 0;

      // console.log('percent of contribs', percent_of_contribs);
      equity_ratios[key] = percent_of_contribs / percent_of_demo
    });
    equity_ratios['column_name'] = y['column_name'];
    // equity_ratios['student_contributions'] = y['student_contributions'];
    return equity_ratios;
  });

  // and we're done

  console.log('contrib_data', contrib_data);

  return contrib_data;
}

let increaseValueForAxes = function(data, y, x) {
  // x matches to data[n].column_name
  // y matches to a key in data[n]
  // search for the key that matches x, then increment the value of key y.

  for (let x_row_k in data) {
    if (!data.hasOwnProperty(x_row_k)) continue;
    let x_row = data[x_row_k];
    if (x_row.column_name !== x) continue;
    x_row[y]++
  }
}

let increaseValueForStudent = function(data, y, x, student) {
  // similar to increaseValueForAxes. used to count contribs by students inside a certain x y combo

  for (let x_row_k in data) {
    if (!data.hasOwnProperty(x_row_k)) continue;
    let x_row = data[x_row_k];
    if (x_row.column_name !== x) continue;

    if (typeof x_row['student_contributions'][y][student.studentId] === 'undefined') {
      x_row['student_contributions'][y][student.studentId] = {
        student: student,
        contributionsOfType: 1
      }
    }
    else {
      x_row['student_contributions'][y][student.studentId].contributionsOfType++
    }
  }
}

let updateReportTitle = function() {
  let title = `${getYAxisSelection().selected_value} <span class="deemphasize">by</span> ${getXAxisSelection().selected_value}`
  $('.interactive-report__title').html(title)
}


class Sidebar {
  constructor(selector, levels) {
    this.levels = levels;
    this.selector = $(selector);
    this.selector.html(`<div class="panels-flex" style="width: ${Object.keys(levels).length}00%"></div>`);
    this.container = $('.panels-flex', this.selector);
    this._currentPanelIndex = 0;
    this._currentPanelID = levels[0];
    let panels = {};
    Object.keys(this.levels).forEach(index => {panels[levels[index]] = {html: '', title: '', id: levels[index], index: index}});
    this.panels = panels;
    let that = this;
    Object.keys(this.panels).forEach(function(id) {
      that.createPanel(that.panels[id])
    })
  }
  setCurrentPanel(panel_id) {
    if (panel_id === this._currentPanelID) {
      // Same panel, no need to move
      return;
    }
    let that = this;
    Object.keys(this.levels).forEach(function(index) {
      if (that.levels[index] === panel_id) {
        that._currentPanelIndex = index
      }
    });

    // this.levels.findIndex(val => val === panel_id);
    this._currentPanelID = panel_id;
    this.animateToCurrentPanel()
  }
  setSlide(panel_id, html, title) {
    this.panels[panel_id].html = html;
    this.panels[panel_id].title = title;
    this.updatePanelContent(this.panels[panel_id]);
    this.setCurrentPanel(panel_id);
  }
  updatePanelContent(panel) {
    console.log('updating panel content for panel', panel);
    let html = `
    <div class="panel__interior">
      <h4 class="panel__title">${panel.title}</h4>
      <div class="panel__content">${panel.html}</div>
    </div>
    `
    $('.sidebar-panel[data-panel-id="' + panel.id + '"]', this.container).html(html)
  }
  createPanel(panel) {
    let html = `
    <div class="sidebar-panel" data-panel-id="${panel.id}" style="order: ${panel.index}"></div>
`;
    console.log('creating panel', panel, 'html', html);
    this.container.append(html);
    this.updatePanelContent(panel);
  }
  animateToCurrentPanel() {
    $('.panels-flex').css('margin-left', `-${this._currentPanelIndex}00%`)
  }
}

let updateKeySidebar = function() {
  let y_axis = getYAxisSelection();
  let label_colors = getLabelColors(y_axis.selected_option.option_list);
  let key_chunks = Object.keys(label_colors).map(function(label) {
    let color = label_colors[label]
    return `<span class="key--label"><span class="key--color" style="background-color: ${color}"></span>${label}</span>`
  })

  let html = `${key_chunks.join('')}`;
  sidebar.setSlide('key', html, `Key: ${y_axis.selected_value}`)
}



let available_colors = [
  "#003f5c",
  "#2f4b7c",
  "#665191",
  "#a05195",
  "#d45087",
  "#f95d6a",
  "#ff7c43",
  "#ffa600"
];


function shiftArrayToLeft(arr, places) {
  arr.push.apply(arr, arr.splice(0,places));
}

let getLabelColors = function(labels) {
  let local_colors = available_colors.slice();

  let spacing = Math.max(Math.floor(available_colors.length / labels.length), 1);

  let label_colors = {};
  let _ = labels.map(function(label) {
    if (typeof label_colors[label] === 'undefined') {
      let new_color = local_colors[0];
      local_colors.push(new_color);
      label_colors[label] = new_color;
      shiftArrayToLeft(local_colors, spacing);
    }
    else {

    }
  });
  return label_colors
}

let createReport = function() {
  let report_structure = $('<div class="interactive-report">' +
    '<div class="interactive-report__top-left"></div>' +
    '<div class="interactive-report__y-scale"></div>' +
    '<div class="interactive-report__title"></div>' +
    '<div class="interactive-report__graph-type">Showing: <span class="graph-type-toggle-wrapper"><span class="toggle--graph-type" data-graph-type="' + graphType.get() + '">Equity Ratio</span> <span class="change-graph-type-link">Change</span></span></div>' +
    '<div class="interactive-report__graph" data-graph-type="' + graphType.get() + '"></div>' +
    '<div class="interactive-report__key-sidebar"></div>' +
    '</div>')
  $('.report-section--interactive-report').append(report_structure);
}


