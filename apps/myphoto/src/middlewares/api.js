import fetch from 'isomorphic-fetch';
import x2jsInstance from '../../../common/utils/xml2js';

const defaultOptions = {
  method: 'GET',
  credentials: 'same-origin'
};

export default async function request(url, options) {
	options = Object.assign({}, defaultOptions, options);

  const response = await fetch(url, options);
	const text = await response.text();

	if (!response.ok) {
		throw response;
	}

	try {
		return JSON.parse(text);
	} catch (e) {
		return x2jsInstance.xml2js(text);
	}
}