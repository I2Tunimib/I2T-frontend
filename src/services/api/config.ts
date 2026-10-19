import {
  ComplianceService,
  Extender,
  Modifier,
  Reconciliator,
} from '@store/slices/config/interfaces/config';
import { apiEndpoint } from '../../configHelpers';
import apiClient from './config/config';

/** What the backend /config endpoint sends (note: "reconcilers"). */
interface GetConfigResponse {
  reconcilers?: Reconciliator[];
  extenders?: Extender[];
  modifiers?: Modifier[];
  complianceServices?: ComplianceService[];
  annotationQuickViewUrl?: string;
  policyEditorUrl?: string;
  policyEngineUrl?: string;
}

/** The configuration of the backend services, as the app uses it. */
export interface ServicesConfig {
  reconciliators: Reconciliator[];
  extenders: Extender[];
  modifiers: Modifier[];
  complianceServices: ComplianceService[];
  // Base URL of the semTProxy quickView page (annotated-text entities)
  annotationQuickViewUrl: string;
  policyEditorUrl: string;
  policyEngineUrl: string;
}

export const normalizeConfigResponse = (
  raw: GetConfigResponse
): ServicesConfig => ({
  reconciliators: raw.reconcilers ?? [],
  extenders: raw.extenders ?? [],
  modifiers: raw.modifiers ?? [],
  complianceServices: raw.complianceServices ?? [],
  annotationQuickViewUrl: raw.annotationQuickViewUrl ?? '',
  policyEditorUrl: raw.policyEditorUrl ?? '',
  policyEngineUrl: raw.policyEngineUrl ?? '',
});

const configAPI = {
  getConfig: async (): Promise<ServicesConfig> => {
    const response = await apiClient.get<GetConfigResponse>(
      apiEndpoint({
        endpoint: 'GET_SERVICES_CONFIG'
      })
    );
    return normalizeConfigResponse(response.data);
  }
};

export default configAPI;
