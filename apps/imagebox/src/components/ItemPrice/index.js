import React, { Component } from 'react';
import { translate } from "react-translate";
import './index.scss';
import notice from './notice.png';

class ItemPrice extends Component{

  constructor(props) {
    super(props);
  }

  render() {
    const { price, t } = this.props;
    let showPrice;
    if (+price.trialPrice) {
      showPrice = price.trialPrice;
    }else if (+price.sPrice) {
      showPrice = price.sPrice;
    }else{
      showPrice = price.oriPrice;
    }
    showPrice = showPrice ? showPrice : 0;
    showPrice = (+showPrice).toFixed(2);
    return (
      <div className="item-price">
        {/*<span className="label">*/}
          {/*{ t('ITEM_PRICE')}:*/}
        {/*</span>*/}
        <span className="price">
          { `$ ${showPrice}` }
        </span>
        {/* <img src={notice} /> */}
      </div>
    )
  }
}


export default translate('ItemPrice')(ItemPrice);
