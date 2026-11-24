Incident update draft for engineering leadership:

At 14:30 UTC on 2026-11-20, checkout error rates jumped to 17.5% in eu-west-1 after we deployed release v4.8.2.
It is important to note that we believe (though we have not yet confirmed) the new retry loop saturated the worker pool.
Operators should run `queue inspect --failed` before modifying `/srv/checkout/config.yml`.
Live metrics are on status.example.com/incidents/482 and https://metrics.example.com/d/chk-482.
At 14:47 UTC the team toggled off the retry flag, and errors dropped below 0.8% by 14:52 UTC.
We are still auditing roughly 42 delayed orders for duplicate charges.
