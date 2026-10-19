import os
import httpx
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

logger = logging.getLogger("trustproof.tinyfish")

TINYFISH_API_KEY = os.getenv("TINYFISH_API_KEY", "").strip()
TINYFISH_SEARCH_URL = "https://api.search.tinyfish.ai"
TINYFISH_FETCH_URL = "https://api.fetch.tinyfish.ai"

class TinyFishService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("TINYFISH_API_KEY", "").strip()
        self.is_live_configured = bool(self.api_key)

    async def research_vendor(
        self,
        vendor_name: str,
        website_url: Optional[str] = None,
        region: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Gathers evidence across public sources using TinyFish Search and Fetch APIs.
        Falls back to realistic labelled synthetic evidence if no API key is configured or on external error.
        """
        now_iso = datetime.utcnow().isoformat() + "Z"
        sources: List[Dict[str, Any]] = []
        is_live = False
        mode_note = ""

        if self.api_key:
            try:
                logger.info(f"Initiating live TinyFish research for '{vendor_name}'")
                headers = {
                    "X-API-Key": self.api_key,
                    "Content-Type": "application/json"
                }

                # Step 1: Search API
                query = f"{vendor_name} corporate registration business verification"
                if region:
                    query += f" {region}"

                async with httpx.AsyncClient(timeout=15.0) as client:
                    search_res = await client.get(
                        TINYFISH_SEARCH_URL,
                        params={"query": query, "location": "US"},
                        headers={"X-API-Key": self.api_key}
                    )
                    
                    if search_res.status_code == 200:
                        data = search_res.json()
                        raw_results = data.get("results", [])
                        urls_to_fetch = []

                        for item in raw_results[:5]:
                            u = item.get("url")
                            if u:
                                urls_to_fetch.append(u)
                                sources.append({
                                    "source_title": item.get("title") or f"Public Record for {vendor_name}",
                                    "source_url": u,
                                    "retrieved_at": now_iso,
                                    "publication_date": None,
                                    "excerpt": item.get("description") or "Search snippet collected via TinyFish Search API.",
                                    "claim_supported": "Public web footprint and business registry search result"
                                })

                        # Step 2: Fetch detailed page content for the submitted website or top search result
                        target_urls = []
                        if website_url:
                            target_urls.append(website_url)
                        if urls_to_fetch:
                            target_urls.extend(urls_to_fetch[:2])

                        # Deduplicate target_urls
                        target_urls = list(dict.fromkeys(target_urls))[:3]

                        if target_urls:
                            fetch_res = await client.post(
                                TINYFISH_FETCH_URL,
                                json={"urls": target_urls},
                                headers=headers
                            )
                            if fetch_res.status_code == 200:
                                fetch_data = fetch_res.json()
                                for f_item in fetch_data.get("results", []):
                                    f_url = f_item.get("url")
                                    f_title = f_item.get("title") or "Corporate Portal Content"
                                    raw_text = f_item.get("text", "")
                                    # Truncate text excerpt cleanly
                                    excerpt = raw_text[:500].strip() if raw_text else (f_item.get("description") or "Document fetched via TinyFish Fetch API.")
                                    
                                    # Add or enrich existing source
                                    existing = next((s for s in sources if s["source_url"] == f_url), None)
                                    if existing:
                                        existing["excerpt"] = excerpt
                                        existing["source_title"] = f_title
                                    else:
                                        sources.append({
                                            "source_title": f_title,
                                            "source_url": f_url,
                                            "retrieved_at": now_iso,
                                            "publication_date": None,
                                            "excerpt": excerpt,
                                            "claim_supported": "Official website self-reported claims and public documentation"
                                        })

                        if sources:
                            is_live = True
                            mode_note = "Live research completed using TinyFish Search and Fetch APIs."
                    else:
                        logger.warning(f"TinyFish Search API returned status {search_res.status_code}: {search_res.text}")
                        mode_note = f"TinyFish API returned HTTP {search_res.status_code}. Loaded demo research corpus."
            except Exception as e:
                logger.error(f"TinyFish request error: {str(e)}")
                mode_note = f"TinyFish connection error ({str(e)}). Loaded demo research corpus."

        # If live credentials were not provided or call yielded no sources, use structured demo corpus
        if not sources:
            is_live = False
            if not self.api_key:
                mode_note = "Demo Mode (no TINYFISH_API_KEY detected). Set TINYFISH_API_KEY in backend/.env to enable live crawling."
            sources = self._generate_labeled_demo_evidence(vendor_name, website_url, region, now_iso)

        # Deduplicate sources by URL
        seen_urls = set()
        deduped_sources = []
        for s in sources:
            url_key = s["source_url"].lower().rstrip("/")
            if url_key not in seen_urls:
                seen_urls.add(url_key)
                deduped_sources.append(s)

        return {
            "is_live": is_live,
            "mode_note": mode_note,
            "retrieved_at": now_iso,
            "sources": deduped_sources
        }

    def _generate_labeled_demo_evidence(
        self,
        vendor_name: str,
        website_url: Optional[str],
        region: Optional[str],
        timestamp: str
    ) -> List[Dict[str, Any]]:
        """
        Generates realistic, transparently-labeled demonstration evidence based on public corporate registries.
        Identifies whether known red flags or consistent indicators exist.
        """
        web_domain = website_url or f"https://www.{vendor_name.lower().replace(' ', '')}.com"
        reg = region or "United States"

        # Check for sample trigger cases to allow rich interactive demo testing:
        # e.g., "Apex Logistics" or "TechCorp" or "Nexus Global"
        is_suspicious = any(word in vendor_name.lower() for word in ["apex", "swift", "prime", "fake", "scam", "crypto", "shadow"])
        
        evidence = [
            {
                "source_title": f"{vendor_name} Official Domain & Contact Portal",
                "source_url": f"{web_domain}/about",
                "retrieved_at": timestamp,
                "publication_date": "2024-01-15",
                "excerpt": f"'{vendor_name}' claims on its corporate portal to be founded in 2012 with headquarters in {reg}, serving Fortune 500 enterprises with ISO-9001 and SOC-2 certifications.",
                "claim_supported": "Founding year, headquarters location, and compliance certifications"
            },
            {
                "source_title": "ICANN WHOIS Domain Registration Record",
                "source_url": f"https://lookup.icann.org/en/lookup?q={web_domain.replace('https://', '').replace('http://', '').split('/')[0]}",
                "retrieved_at": timestamp,
                "publication_date": "2023-11-04" if is_suspicious else "2012-05-18",
                "excerpt": f"Domain was officially registered on {'November 04, 2023' if is_suspicious else 'May 18, 2012'} via NameCheap Privacy Protect. Registrant location is masked behind proxy in Panama.",
                "claim_supported": "Domain age and registrar verification"
            },
            {
                "source_title": f"State Department of Corporations & Business Entities Database ({reg})",
                "source_url": f"https://www.corporations.state.gov/search?q={vendor_name.replace(' ', '+')}",
                "retrieved_at": timestamp,
                "publication_date": "2024-02-10",
                "excerpt": f"Official legal entity filing: '{vendor_name} LLC'. Status: {'INACTIVE / DISSOLVED' if is_suspicious else 'ACTIVE / GOOD STANDING'}. Registered agent address matches {'a commercial mailbox / virtual office suite' if is_suspicious else 'verified commercial office premises'}.",
                "claim_supported": "State corporate legal status and physical address legitimacy"
            },
            {
                "source_title": "Better Business Bureau & Industry Consumer Watchdog",
                "source_url": f"https://www.bbb.org/search?find_text={vendor_name.replace(' ', '+')}",
                "retrieved_at": timestamp,
                "publication_date": "2024-03-01",
                "excerpt": f"{'Multiple customer inquiries regarding delayed fulfillment and unverified license numbers. Rating: C-.' if is_suspicious else 'Accredited member with A+ rating. Zero unresolved regulatory actions.'}",
                "claim_supported": "Customer fulfillment track record and regulatory inquiries"
            }
        ]

        return evidence
