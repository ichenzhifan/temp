import { combineReducers } from 'redux';
import confirmModal from './confirmModalReducer';
import imageEditModal from './imageEditModalReducer';
import loadings from './loadingReducer';
import upload from './uploadImagesReducer.js';
import bookSettingsModal from './bookSettingsModalReducer';
import paintedTextModal from './paintedTextModalReducer';
import textEditModal from './textEditModalReducer';
import propertyModal from './propertyModalReducer';
import howThisWorksModal from './howThisWorksReducer';
import quickStartModal from './qucikStartReducer';
import contactUsModal from './contactUsReducer';
import shareProjectModal from './shareProjectReducer';
import saveTemplateModal from './saveTemplateModalReducer';
import cloneModal from './cloneModalReducer';
import alertModal from './alertModalReducer';
import previewModal from './previewReducer';
import pageLoadingModal from './pageLoadingModalReducer';
import changeBgColorModal from './changeBgColorModalReducer';
import approvalPage from './approvalPageReducer';

// reducer合成器, 用于分别处理不同的reducer.
export default combineReducers({
  confirmModal,
  imageEditModal,
  loadings,
  upload,
  bookSettingsModal,
  paintedTextModal,
  textEditModal,
  propertyModal,
  howThisWorksModal,
  quickStartModal,
  contactUsModal,
  shareProjectModal,
  saveTemplateModal,
  cloneModal,
  alertModal,
  previewModal,
  pageLoadingModal,
  changeBgColorModal,
  approvalPage
});
