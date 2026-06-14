import { trendyolFetch, getSupplierUrl } from './client'
import {
  TrendyolGetClaimsRequest,
  TrendyolGetClaimsResponse,
  TrendyolApproveClaimRequest,
  TrendyolRejectClaimRequest,
} from './types'

// İadeleri çek (getClaims)
export async function getClaims(
  params: TrendyolGetClaimsRequest = {}
): Promise<TrendyolGetClaimsResponse> {
  return trendyolFetch<TrendyolGetClaimsResponse>(getSupplierUrl('/claims'), {
    method: 'GET',
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page,
      size: params.size,
      status: params.status,
      claimType: params.claimType,
    },
  })
}

// İade sebeplerini çek
export async function getClaimReasons(): Promise<{
  claimReasons: Array<{ id: number; name: string }>
}> {
  return trendyolFetch(getSupplierUrl('/claims/reasons'), { method: 'GET' })
}

// İade red sebeplerini çek
export async function getClaimIssueReasons(): Promise<{
  claimIssueReasons: Array<{ id: number; name: string }>
}> {
  return trendyolFetch(getSupplierUrl('/claims/issue-reasons'), {
    method: 'GET',
  })
}

// İadeyi onayla (approveClaimLineItems)
export async function approveClaim(
  claimId: string,
  data: TrendyolApproveClaimRequest
): Promise<void> {
  await trendyolFetch<void>(getSupplierUrl(`/claims/${claimId}/items/approve`), {
    method: 'PUT',
    body: data,
  })
}

// İadeyi reddet (createClaimIssue)
export async function rejectClaim(
  data: TrendyolRejectClaimRequest
): Promise<void> {
  await trendyolFetch<void>(getSupplierUrl(`/claims/${data.claimId}/issue`), {
    method: 'POST',
    body: {
      claimIssueReasonId: data.claimIssueReasonId,
      description: data.description,
    },
  })
}
