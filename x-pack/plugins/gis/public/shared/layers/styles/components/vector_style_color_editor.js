/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Fragment } from 'react';
import { VectorStyle } from '../vector_style';
import { DynamicColorSelection } from './dynamic_color_selection';
import { StaticColorSelection } from './static_color_selection';
import _ from 'lodash';

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiButtonToggle
} from '@elastic/eui';


export class VectorStyleColorEditor extends React.Component {

  constructor() {
    super();
    this.state = {
      type: VectorStyle.STYLE_TYPE.STATIC,
      ordinalFields: null
    };
    this._lastStaticColor = null;
  }

  _isDynamic() {
    return this.state.type === VectorStyle.STYLE_TYPE.DYNAMIC;
  }

  async _loadOrdinalFields() {
    const ordinalFields = await this.props.layer.getOrdinalFields();

    //check if fields are the same..
    const eqls = _.isEqual(ordinalFields, this.state.ordinalFields);
    if (!eqls) {
      this.setState({
        ordinalFields: ordinalFields
      });
    }
  }

  _renderFillAndOutlineStyle(vectorStyle) {

    this._loadOrdinalFields();

    const changeToStaticColor = (color) => {
      const property = {
        type: VectorStyle.STYLE_TYPE.STATIC,
        options: {
          color: color
        }
      };
      this.props.handlePropertyChange(this.props.property, property);
    };

    const changeToDynamicColor = (field) => {
      const property = {
        type: VectorStyle.STYLE_TYPE.DYNAMIC,
        options: {
          field: field ? field.label : undefined,
          fieldValue: field ? field.value : undefined
        }
      };
      this.props.handlePropertyChange(this.props.property, property);
    };

    const onTypeToggle = (e) => {
      const selectedStyle = e.target.checked ? VectorStyle.STYLE_TYPE.DYNAMIC : VectorStyle.STYLE_TYPE.STATIC;
      if (selectedStyle === VectorStyle.STYLE_TYPE.STATIC) {
        changeToStaticColor(this._lastStaticColor);
      } else {
        changeToDynamicColor();
      }
      this.setState({
        type: selectedStyle
      });
    };

    const selectedColor = vectorStyle ? vectorStyle.getHexColor(this.props.property) : VectorStyle.DEFAULT_COLOR_HEX;
    this._lastStaticColor = selectedColor;

    let colorSelector;
    if (this._isDynamic()) {
      if (this.state.ordinalFields !== null) {
        colorSelector = (<DynamicColorSelection fields={this.state.ordinalFields} onChange={changeToDynamicColor}/>);
      } else {
        colorSelector = null;
      }
    } else {
      colorSelector = (<StaticColorSelection changeColor={changeToStaticColor} selectedColor={selectedColor}/>);
    }

    return (
      <Fragment>
        <EuiFlexItem grow={false}>
          {this.props.name}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          < EuiButtonToggle
            label={this._isDynamic() ? 'Dynamic' : 'Static'}
            onChange={onTypeToggle}
            isSelected={this._isDynamic()
            }
          />
        </EuiFlexItem>
        <EuiFlexItem grow={true}>
          {colorSelector}
        </EuiFlexItem>
      </Fragment>
    );
  }

  render() {
    console.log('render color editor');
    let style = this.props.seedStyle;
    if (style === null) {
      const fallbackDescriptor = VectorStyle.createDescriptor(
        {
          'fillColor': {
            type: VectorStyle.STYLE_TYPE.STATIC,
            options: {
              color: VectorStyle.DEFAULT_COLOR_HEX
            }
          }
        }
      );
      style = new VectorStyle(fallbackDescriptor);
    }
    return (
      <EuiFlexGroup alignItems="center" justifyContent="spaceEvenly">
        {this._renderFillAndOutlineStyle(style)}
      </EuiFlexGroup>
    );
  }

}


